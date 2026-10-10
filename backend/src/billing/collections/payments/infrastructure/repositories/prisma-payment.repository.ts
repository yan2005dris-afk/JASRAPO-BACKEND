import { EnsureContractWorkOrderUseCase } from 'src/operations/contracts/application/use-cases/ensure-contract-work-order.use-case';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { TransactionContext } from 'src/shared/domain/types/transaction';
import {
  Prisma,
  EstadoPago,
  EstadoCaja,
  EstadoCuotaConvenio,
  Banco,
  TarjetaCredito,
} from 'src/generated/prisma/client';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { paymentInclude, type PaymentRow } from './payment.include';
import type {
  PaymentFilters,
  ComprobanteInfo,
  CuotaConvenioPaymentInfo,
  CreatePagoRecordData,
  CreateDetallePagoData,
  CreateSaldoFavorData,
} from '../../domain/types/payment.types';
import {
  paginate,
  type PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import { Decimal } from 'decimal.js';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(
    tx?: TransactionContext,
  ): TransactionContext | PrismaService {
    return tx ?? this.prisma;
  }

  async findById(
    id: bigint,
    tx?: TransactionContext,
  ): Promise<PaymentRow | null> {
    const client = this.getClient(tx);
    return client.pagos.findFirst({
      where: { pagoId: id, deletedAt: null },
      include: paymentInclude,
    });
  }

  async paginate(
    pagination: PaginateOptions,
    filters?: PaymentFilters,
  ): Promise<PaginatedResult<PaymentRow>> {
    const where: Prisma.PagosWhereInput = {
      deletedAt: null,
      ...(filters?.clienteId ? { clienteId: BigInt(filters.clienteId) } : {}),
      ...(filters?.estadoPago
        ? { estadoPago: filters.estadoPago as EstadoPago }
        : {}),
      ...(filters?.banco ? { banco: filters.banco as Banco } : {}),
      ...(filters?.tarjetaCredito
        ? { tarjetaCredito: filters.tarjetaCredito as TarjetaCredito }
        : {}),
      ...this.buildDateFilter(filters?.fechaDesde, filters?.fechaHasta),
    };

    const paginated = await paginate<PaymentRow>(
      this.prisma.pagos,
      {
        where,
        include: paymentInclude,
        orderBy: { fechaPago: 'desc' },
      },
      pagination,
    );

    return paginated;
  }

  async findSaldoFavorByCliente(
    clienteId: bigint,
  ): Promise<PaymentRow['saldosFavor']> {
    return this.prisma.saldoFavorCliente.findMany({
      where: {
        clienteId,
        deletedAt: null,
        disponibleParaAplicar: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDailyCashPayments(params: {
    fechaInicio: Date;
    fechaFin: Date;
    cajaId?: bigint;
  }): Promise<PaymentRow[]> {
    return this.prisma.pagos.findMany({
      where: {
        deletedAt: null,
        estadoPago: EstadoPago.REGISTRADO,
        fechaPago: { gte: params.fechaInicio, lt: params.fechaFin },
        ...(params.cajaId ? { cajaId: params.cajaId } : {}),
      },
      include: paymentInclude,
      orderBy: { fechaPago: 'asc' },
    });
  }

  async findPaymentDetailsByPagoId(
    pagoId: bigint,
  ): Promise<PaymentRow['detallePago']> {
    return this.prisma.detallePago.findMany({
      where: { pagoId, deletedAt: null },
      include: {
        comprobante: {
          select: {
            id: true,
            tipoComprobante: true,
            secuencial: true,
            importeTotal: true,
            estado: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }) as unknown as Promise<PaymentRow['detallePago']>;
  }

  async findPaymentDetailsByComprobanteId(
    comprobanteId: bigint,
  ): Promise<PaymentRow['detallePago']> {
    return this.prisma.detallePago.findMany({
      where: {
        comprobanteId,
        deletedAt: null,
        pago: {
          deletedAt: null,
          estadoPago: { not: EstadoPago.ANULADO },
        },
      },
      select: {
        detallePagoId: true,
        pagoId: true,
        comprobanteId: true,
        cuotaConvenioId: true,
        tipoPago: true,
        montoAbonado: true,
        formaPagoId: true,
        referencia: true,
        fechaTransaccion: true,
        createdAt: true,
        deletedAt: true,
      },
    }) as unknown as Promise<PaymentRow['detallePago']>;
  }

  async clientExists(clienteId: bigint): Promise<boolean> {
    const count = await this.prisma.clientes.count({
      where: { clienteId, deletedAt: null },
    });
    return count > 0;
  }

  async isCajaOpen(cajaId: bigint): Promise<boolean> {
    const count = await this.prisma.cajaSesion.count({
      where: { cajaId, estado: EstadoCaja.ABIERTA },
    });
    return count > 0;
  }

  async findComprobanteById(
    comprobanteId: bigint,
    tx?: TransactionContext,
  ): Promise<ComprobanteInfo | null> {
    const client = this.getClient(tx);
    const record = await client.comprobantes.findFirst({
      where: { id: comprobanteId },
      select: { id: true, importeTotal: true },
    });
    if (!record) return null;
    return {
      id: BigInt(record.id),
      importeTotal: record.importeTotal ? Number(record.importeTotal) : null,
    };
  }

  async lockComprobante(
    comprobanteId: bigint,
    tx: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.$queryRaw`
      SELECT id FROM "comprobantes"
      WHERE id = ${comprobanteId}
      FOR UPDATE
    `;
  }

  async findComprobanteAppliedSum(
    comprobanteId: bigint,
    tx?: TransactionContext,
  ): Promise<number> {
    const client = this.getClient(tx);
    const records = await client.detallePago.findMany({
      where: {
        comprobanteId,
        deletedAt: null,
        pago: {
          deletedAt: null,
          estadoPago: { not: EstadoPago.ANULADO },
        },
      },
      select: { montoAbonado: true },
    });

    const sum = records.reduce(
      (acc, r) => acc.plus(new Decimal(r.montoAbonado)),
      new Decimal(0),
    );
    return sum.toNumber();
  }

  async findCuotaConvenioById(
    cuotaId: bigint,
    tx?: TransactionContext,
  ): Promise<CuotaConvenioPaymentInfo | null> {
    const client = this.getClient(tx);
    const record = await client.cuotaConvenio.findFirst({
      where: { cuotaConvenioId: cuotaId },
      select: {
        cuotaConvenioId: true,
        convenioId: true,
        estado: true,
        saldoPendiente: true,
        montoPagado: true,
        deletedAt: true,
      },
    });
    if (!record) return null;
    return {
      cuotaConvenioId: BigInt(record.cuotaConvenioId),
      convenioId: BigInt(record.convenioId),
      estado: record.estado,
      saldoPendiente: Number(record.saldoPendiente),
      montoPagado: Number(record.montoPagado),
      deletedAt: record.deletedAt ?? null,
    };
  }

  async findSaldoFavorById(
    saldoFavorId: bigint,
    tx?: TransactionContext,
  ): Promise<PaymentRow['saldosFavor'][number] | null> {
    const client = this.getClient(tx);
    return client.saldoFavorCliente.findFirst({
      where: { saldoFavorId },
    });
  }

  async createPagoRecord(
    data: CreatePagoRecordData,
    tx: TransactionContext,
  ): Promise<{ pagoId: bigint }> {
    const client = this.getClient(tx);
    const record = await client.pagos.create({
      data: {
        clienteId: data.clienteId,
        cajaId: data.cajaId,
        banco: data.banco as Banco | null,
        tarjetaCredito: data.tarjetaCredito as TarjetaCredito | null,
        fechaPago: data.fechaPago,
        montoTotalRecibido: data.montoTotalRecibido,
        numeroOperacion: data.numeroOperacion,
        observaciones: data.observaciones,
        referenciaBanco: data.referenciaBanco,
        comprobanteUrl: data.comprobanteUrl,
        estadoPago: data.estadoPago as EstadoPago,
        creadoPor: data.creadoPor,
      },
      select: { pagoId: true },
    });
    return { pagoId: BigInt(record.pagoId) };
  }

  async createDetallesPago(
    detalles: CreateDetallePagoData[],
    tx: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.detallePago.createMany({
      data: detalles.map((d) => ({
        pagoId: d.pagoId,
        comprobanteId: d.comprobanteId,
        cuotaConvenioId: d.cuotaConvenioId,
        tipoPago: d.tipoPago as any,
        montoAbonado: d.montoAbonado,
        formaPagoId: d.formaPagoId,
        referencia: d.referencia,
        fechaTransaccion: d.fechaTransaccion,
      })),
    });
  }

  async createSaldoFavorRecord(
    data: CreateSaldoFavorData,
    tx: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.saldoFavorCliente.create({
      data: {
        clienteId: data.clienteId,
        pagoId: data.pagoId,
        montoSaldo: data.montoSaldo,
        tipoOrigen: data.tipoOrigen as any,
        disponibleParaAplicar: data.disponibleParaAplicar,
      },
    });
  }

  async updateCuotaConvenioPayment(
    cuotaConvenioId: bigint,
    saldoPendienteActual: number,
    data: {
      montoPagado: number;
      saldoPendiente: number;
      estado: string;
      pagoCompleto: boolean;
      fechaPago: Date | null;
    },
    tx: TransactionContext,
  ): Promise<{ count: number }> {
    const client = this.getClient(tx);
    const result = await client.cuotaConvenio.updateMany({
      where: {
        cuotaConvenioId,
        saldoPendiente: saldoPendienteActual,
      },
      data: {
        montoPagado: data.montoPagado,
        saldoPendiente: data.saldoPendiente,
        estado: data.estado as EstadoCuotaConvenio,
        pagoCompleto: data.pagoCompleto,
        fechaPago: data.fechaPago,
      },
    });
    return { count: result.count };
  }

  async updateCuotaConvenioRevert(
    cuotaConvenioId: bigint,
    data: {
      montoPagado: number;
      saldoPendiente: number;
      estado: string;
      pagoCompleto: boolean;
      fechaPago?: Date | null;
    },
    tx: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.cuotaConvenio.update({
      where: { cuotaConvenioId },
      data: {
        montoPagado: data.montoPagado,
        saldoPendiente: data.saldoPendiente,
        estado: data.estado as EstadoCuotaConvenio,
        pagoCompleto: data.pagoCompleto,
        ...(data.fechaPago !== undefined && { fechaPago: data.fechaPago }),
      },
    });
  }

  async updateSaldoFavorRecord(
    saldoFavorId: bigint,
    data: {
      disponibleParaAplicar?: boolean;
      montoSaldo?: number;
      deletedAt?: Date;
    },
    tx: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.saldoFavorCliente.update({
      where: { saldoFavorId },
      data: {
        ...(data.disponibleParaAplicar !== undefined && {
          disponibleParaAplicar: data.disponibleParaAplicar,
        }),
        ...(data.montoSaldo !== undefined && { montoSaldo: data.montoSaldo }),
        ...(data.deletedAt !== undefined && { deletedAt: data.deletedAt }),
      },
    });
  }

  async updateManySaldoFavorByPagoId(
    pagoId: bigint,
    data: { disponibleParaAplicar: boolean; deletedAt: Date },
    tx: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.saldoFavorCliente.updateMany({
      where: { pagoId, deletedAt: null },
      data: {
        disponibleParaAplicar: data.disponibleParaAplicar,
        deletedAt: data.deletedAt,
      },
    });
  }

  async updateManyDetallePagoByPagoId(
    pagoId: bigint,
    data: { deletedAt: Date },
    tx: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.detallePago.updateMany({
      where: { pagoId, deletedAt: null },
      data: { deletedAt: data.deletedAt },
    });
  }

  async updatePagoState(
    pagoId: bigint,
    estadoPago: string,
    observaciones?: string,
    tx?: TransactionContext,
  ): Promise<void> {
    const client = this.getClient(tx);
    await client.pagos.update({
      where: { pagoId },
      data: {
        estadoPago: estadoPago as EstadoPago,
        ...(observaciones !== undefined && { observaciones }),
      },
    });
  }

  async annulPagoTransaction(
    pagoId: bigint,
    currentEstado: string,
    data: {
      motivoAnulacion: string;
      anuladoPor: string;
      fechaAnulacion: Date;
      deletedAt: Date;
    },
    tx: TransactionContext,
  ): Promise<{ count: number }> {
    const client = this.getClient(tx);
    const result = await client.pagos.updateMany({
      where: {
        pagoId,
        estadoPago: currentEstado as EstadoPago,
        deletedAt: null,
      },
      data: {
        estadoPago: EstadoPago.ANULADO,
        motivoAnulacion: data.motivoAnulacion,
        fechaAnulacion: data.fechaAnulacion,
        anuladoPor: data.anuladoPor,
        deletedAt: data.deletedAt,
      },
    });
    return { count: result.count };
  }

  async settlePaidComprobante(
    comprobanteId: bigint,
    totalAbonado: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const prefacturas = await tx.prefacturas.findMany({
        where: { comprobanteId, deletedAt: null },
        select: {
          contratoId: true,
          prefacturaDetalle: {
            where: {
              deletedAt: null,
              rubro: { codigoSistemaRubro: 'INSTALACION', deletedAt: null },
            },
            select: { prefacturaDetalleId: true },
          },
        },
      });
      await tx.prefacturas.updateMany({
        where: { comprobanteId, deletedAt: null },
        data: {
          estado: 'PAGADA',
          saldoActual: 0,
          saldoVencido: 0,
          abono: totalAbonado,
        },
      });
      const ids = [
        ...new Set(
          prefacturas
            .filter((p) => p.prefacturaDetalle.length > 0)
            .map((p) => p.contratoId),
        ),
      ].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      for (const contratoId of ids) {
        await tx.$queryRaw`SELECT contrato_id FROM contratos WHERE contrato_id = ${contratoId} FOR UPDATE`;
        const contract = await tx.contratos.findUnique({
          where: { contratoId },
        });
        if (
          !contract ||
          contract.deletedAt ||
          contract.estadoServicio !== 'PENDIENTE_PAGO'
        )
          continue;
        const link = await tx.historialMedidores.findFirst({
          where: {
            contratoId,
            fechaHasta: null,
            deletedAt: null,
            medidor: { estado: 'PENDIENTE', deletedAt: null },
          },
        });
        if (!link)
          throw new InvalidDomainOperationException(
            'La instalación requiere un medidor pendiente y vinculado al contrato',
          );
        await tx.contratos.update({
          where: { contratoId },
          data: {
            estadoServicio: 'PENDIENTE_INSTALACION',
            estadoCobranza: 'NO_APLICA',
          },
        });
        await new EnsureContractWorkOrderUseCase().ensureWorkOrder(
          tx,
          contract,
          link.medidorId,
          'INSTALACION',
        );
      }
    });
  }

  async executeTransaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return callback(tx);
    });
  }

  private buildDateFilter(
    fechaDesde?: string,
    fechaHasta?: string,
  ): Prisma.PagosWhereInput {
    if (!fechaDesde && !fechaHasta) return {};

    return {
      fechaPago: {
        ...(fechaDesde
          ? {
              gte: (() => {
                const d = new Date(fechaDesde);
                d.setHours(0, 0, 0, 0);
                return d;
              })(),
            }
          : {}),
        ...(fechaHasta
          ? {
              lt: (() => {
                const d = new Date(fechaHasta);
                d.setDate(d.getDate() + 1);
                d.setHours(0, 0, 0, 0);
                return d;
              })(),
            }
          : {}),
      },
    };
  }
}
