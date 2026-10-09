import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, EstadoConvenio } from 'src/generated/prisma/client';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { agreementInclude, type AgreementRow } from './agreement.include';
import type {
  AgreementFilters,
  CreateAgreementData,
  CreateInstallmentData,
  PrefacturaDeudaRaw,
  PaymentAgreementReportReadModel,
} from '../../domain/types/agreement.types';
import {
  paginate,
  type PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

/** Límite de PostgreSQL para columnas bigint (int8). */
const PG_BIGINT_MAX = 9223372036854775807n;

/**
 * Convierte un término de búsqueda a bigint solo si es un entero positivo que
 * cabe en una columna int8. Cualquier otro valor devuelve null para que el
 * término se trate únicamente como texto.
 */
function parseIdSearchTerm(search: string): bigint | null {
  if (!/^\d+$/.test(search)) return null;
  const value = BigInt(search);
  return value <= PG_BIGINT_MAX ? value : null;
}

@Injectable()
export class PrismaAgreementRepository implements AgreementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: bigint): Promise<AgreementRow | null> {
    return this.prisma.convenios.findFirst({
      where: { convenioId: id, deletedAt: null },
      include: agreementInclude,
    });
  }

  async findActiveByContractId(
    contratoId: bigint,
  ): Promise<AgreementRow | null> {
    return this.prisma.convenios.findFirst({
      where: {
        contratoId,
        deletedAt: null,
        estado: { in: [EstadoConvenio.ACTIVO, EstadoConvenio.PENDIENTE_ABONO] },
      },
      include: agreementInclude,
    });
  }

  /**
   * Condiciones del buscador de texto libre del listado de convenios: número de
   * guía y datos del cliente, más los identificadores de convenio y contrato
   * cuando el término es numérico, porque la tabla los muestra en pantalla.
   */
  private buildSearchConditions(search: string): Prisma.ConveniosWhereInput[] {
    const conditions: Prisma.ConveniosWhereInput[] = [
      {
        contrato: {
          deletedAt: null,
          OR: [
            { numeroGuia: { contains: search, mode: 'insensitive' } },
            { cliente: { nombres: { contains: search, mode: 'insensitive' } } },
            {
              cliente: { apellidos: { contains: search, mode: 'insensitive' } },
            },
            {
              cliente: {
                razonSocial: { contains: search, mode: 'insensitive' },
              },
            },
            {
              cliente: {
                identificacion: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        },
      },
    ];

    const id = parseIdSearchTerm(search);
    if (id !== null) {
      conditions.push({ convenioId: id }, { contratoId: id });
    }

    return conditions;
  }

  async paginate(
    pagination: PaginateOptions,
    filters?: AgreementFilters,
  ): Promise<PaginatedResult<AgreementRow>> {
    const where: Prisma.ConveniosWhereInput = {
      deletedAt: null,
      ...(filters?.contratoId
        ? { contratoId: BigInt(filters.contratoId) }
        : {}),
      ...(filters?.estado
        ? {
            estado: filters.estado as EstadoConvenio,
          }
        : {}),
      ...(filters?.search
        ? { OR: this.buildSearchConditions(filters.search) }
        : {}),
    };

    const paginated = await paginate<AgreementRow>(
      this.prisma.convenios,
      {
        where,
        include: {
          ...agreementInclude,
          contrato: {
            select: {
              numeroGuia: true,
              cliente: {
                select: {
                  nombres: true,
                  apellidos: true,
                  razonSocial: true,
                  identificacion: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );

    return paginated;
  }

  async findInstallmentsByAgreementId(
    convenioId: bigint,
  ): Promise<AgreementRow['cuotaConvenio']> {
    return this.prisma.cuotaConvenio.findMany({
      where: { convenioId, deletedAt: null },
      orderBy: { numeroCuota: 'asc' },
    });
  }

  async create(
    data: CreateAgreementData,
    cuotas: CreateInstallmentData[],
  ): Promise<AgreementRow> {
    const record = await this.prisma.$transaction(async (tx) => {
      const nuevoConvenio = await tx.convenios.create({
        data: {
          contratoId: data.contratoId,
          numeroCuotas: data.numeroCuotas,
          abonoInicial: data.abonoInicial,
          deudaTotal: data.deudaTotal,
          mesesMoraActual: data.mesesMoraActual,
          estado: data.estado as EstadoConvenio,
          fechaPrimerPago: data.fechaPrimerPago,
          fechaProximoPago: data.fechaProximoPago,
          montoPagadoActual: data.montoPagadoActual,
          motivo: data.motivo ?? null,
        },
      });

      const cuotasToCreate: Prisma.CuotaConvenioCreateManyInput[] = cuotas.map(
        (c) => ({
          convenioId: nuevoConvenio.convenioId,
          numeroCuota: c.numeroCuota,
          valorCuota: c.valorCuota,
          saldoPendiente: c.saldoPendiente,
          fechaVencimiento: c.fechaVencimiento,
          estado: c.estado as any,
          montoPagado: c.montoPagado,
          diasRetraso: c.diasRetraso,
          interesMoraAplicado: c.interesMoraAplicado,
          pagoCompleto: c.pagoCompleto,
        }),
      );

      await tx.cuotaConvenio.createMany({ data: cuotasToCreate });

      return tx.convenios.findUnique({
        where: { convenioId: nuevoConvenio.convenioId },
        include: agreementInclude,
      });
    });

    return record!;
  }

  async updateState(
    id: bigint,
    estado: string,
    data?: { fechaAprobacion?: Date; deletedAt?: Date },
  ): Promise<AgreementRow> {
    try {
      return await this.prisma.convenios.update({
        where: { convenioId: id },
        data: {
          estado: estado as EstadoConvenio,
          ...(data?.fechaAprobacion !== undefined && {
            fechaAprobacion: data.fechaAprobacion,
          }),
          ...(data?.deletedAt !== undefined && { deletedAt: data.deletedAt }),
        },
        include: agreementInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Convenio', id);
      }
      throw error;
    }
  }

  async markAsPaid(id: bigint): Promise<AgreementRow> {
    const hoy = new Date();

    return this.prisma.$transaction(async (tx) => {
      const convenio = await tx.convenios.findUnique({
        where: { convenioId: id },
      });

      if (!convenio) {
        throw new EntityNotFoundException('Convenio', id);
      }

      const cuotasPendientes = await tx.cuotaConvenio.findMany({
        where: { convenioId: id, estado: 'PENDIENTE', deletedAt: null },
        select: { cuotaConvenioId: true, valorCuota: true },
      });

      for (const cuota of cuotasPendientes) {
        await tx.cuotaConvenio.update({
          where: { cuotaConvenioId: cuota.cuotaConvenioId },
          data: {
            estado: 'PAGADA',
            fechaPago: hoy,
            montoPagado: cuota.valorCuota,
            saldoPendiente: 0,
            pagoCompleto: true,
            diasRetraso: 0,
          },
        });
      }

      return tx.convenios.update({
        where: { convenioId: id },
        data: {
          estado: 'PAGADO',
          fechaProximoPago: null,
          montoPagadoActual: convenio.deudaTotal,
        },
        include: agreementInclude,
      });
    });
  }

  async contractExists(contratoId: bigint): Promise<boolean> {
    const count = await this.prisma.contratos.count({
      where: { contratoId, deletedAt: null },
    });
    return count > 0;
  }

  async findActiveInterestRate(): Promise<number | null> {
    const hoy = new Date();
    const tasa = await this.prisma.parametroTasainteres.findFirst({
      where: {
        activo: true,
        vigenteDesde: { lte: hoy },
        OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: hoy } }],
        deletedAt: null,
      },
      orderBy: { vigenteDesde: 'desc' },
      select: { tasa: true },
    });

    if (!tasa) return null;
    return typeof tasa.tasa === 'number' ? tasa.tasa : Number(tasa.tasa);
  }

  async findUnpaidPreInvoices(
    contratoId: bigint,
  ): Promise<PrefacturaDeudaRaw[]> {
    const records = await this.prisma.prefacturas.findMany({
      where: {
        contratoId,
        deletedAt: null,
        estado: { in: ['GENERADA', 'EN_REVISION', 'APROBADA'] },
      },
      select: {
        prefacturaId: true,
        periodoId: true,
        totalPagar: true,
        abono: true,
        estado: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((r) => ({
      prefacturaId: BigInt(r.prefacturaId),
      periodoId: r.periodoId,
      totalPagar: Number(r.totalPagar),
      abono: Number(r.abono),
      estado: r.estado,
      createdAt: r.createdAt,
    }));
  }

  async getPdfData(
    convenioId: bigint,
  ): Promise<PaymentAgreementReportReadModel | null> {
    const convenio = await this.prisma.convenios.findFirst({
      where: { convenioId, deletedAt: null },
      include: {
        contrato: {
          select: {
            numeroGuia: true,
            direccionSuministro: true,
            fechaInicio: true,
            cliente: {
              select: {
                nombres: true,
                apellidos: true,
                razonSocial: true,
                identificacion: true,
                email: true,
              },
            },
          },
        },
        cuotaConvenio: {
          where: { numeroCuota: 1, deletedAt: null },
          take: 1,
          select: { valorCuota: true },
        },
      },
    });

    if (!convenio) return null;

    const firstInstallment = Number(convenio.cuotaConvenio[0]?.valorCuota ?? 0);

    return {
      convenio: {
        convenioId: String(convenio.convenioId),
        contratoId: String(convenio.contratoId),
        deudaTotal: Number(convenio.deudaTotal),
        abonoInicial: Number(convenio.abonoInicial),
        numeroCuotas: convenio.numeroCuotas,
        fechaPrimerPago: convenio.fechaPrimerPago.toISOString(),
        periodoInicio: convenio.contrato.fechaInicio.toISOString(),
        motivo: convenio.motivo,
        createdAt: convenio.createdAt.toISOString(),
        cuotaMensual: firstInstallment,
        primeraCuota: firstInstallment,
        contrato: {
          numeroGuia: convenio.contrato.numeroGuia,
          direccionSuministro: convenio.contrato.direccionSuministro,
        },
        cliente: {
          nombres: convenio.contrato.cliente.nombres,
          apellidos: convenio.contrato.cliente.apellidos,
          razonSocial: convenio.contrato.cliente.razonSocial,
          identificacion: convenio.contrato.cliente.identificacion,
          email: convenio.contrato.cliente.email,
        },
      },
    };
  }
}
