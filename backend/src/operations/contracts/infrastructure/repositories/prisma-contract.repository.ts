import { normalizeContractProcedure } from '../../domain/contract-procedure';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EstadoMedidor, EstadoServicioContrato } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import type {
  CreateContractData,
  CreateContractWithMeterCommand,
  UpdateContractData,
  ContractFilters,
} from '../../domain/types/contract.types';
import { ContractState } from '../../domain/contract-state';
import { ensureContractWorkOrder } from '../contract-work-order';
import { ContractGuideGeneratorService } from '../services/contract-guide-generator.service';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { contractInclude, type ContractRow } from './contract.include';

export const contractDefaultInclude = contractInclude;
export type ContractRecord = ContractRow;

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  private readonly defaultInclude = contractDefaultInclude;

  constructor(
    private readonly prisma: PrismaService,
    private readonly contractGuideGenerator: ContractGuideGeneratorService,
  ) {}

  async findById(
    contratoId: bigint,
    includeDeleted: boolean = false,
  ): Promise<ContractRow | null> {
    const record = await this.prisma.contratos.findFirst({
      where: {
        contratoId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.defaultInclude,
    });
    return record;
  }

  async getConnectionCosts(categoriaTarifaId: number): Promise<{
    costoGuia: number | null;
    derechoInspeccion: number | null;
  }> {
    const [guia, inspeccion] = await Promise.all([
      this.prisma.rubros.findFirst({
        where: {
          categoriaTarifaId,
          codigoSri: { startsWith: 'SERV-GUIA' },
          activo: true,
          deletedAt: null,
        },
        orderBy: { rubroId: 'asc' },
      }),
      this.prisma.rubros.findFirst({
        where: {
          codigoSri: 'SERV-INSP-01',
          activo: true,
          deletedAt: null,
        },
        orderBy: { rubroId: 'asc' },
      }),
    ]);

    return {
      costoGuia: guia ? Number(guia.precioUnitario) : null,
      derechoInspeccion: inspeccion ? Number(inspeccion.precioUnitario) : null,
    };
  }

  async paginateContratos(
    args: {
      filters?: ContractFilters;
      orderBy?: { [key: string]: 'asc' | 'desc' };
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ContractRow>> {
    const where = this.buildContractWhere(args.filters);

    return paginate<ContractRow>(
      this.prisma.contratos,
      {
        where,
        orderBy: args.orderBy as Prisma.ContratosOrderByWithRelationInput,
        include: this.defaultInclude,
      },
      pagination,
    );
  }

  async create(data: CreateContractData): Promise<ContractRow> {
    const estadoServicio =
      data.estadoServicio ?? EstadoServicioContrato.PENDIENTE_PAGO;
    const estadoCobranza = ContractState.normalizeCollectionStatus(
      data.estadoCobranza,
      estadoServicio,
    );
    try {
      return await this.prisma.contratos.create({
        data: {
          ...normalizeContractProcedure(data),
          ...(data.registradoPorId !== undefined
            ? { registradoPorId: data.registradoPorId }
            : {}),
          clienteId: data.clienteId,
          categoriaTarifaId: data.categoriaTarifaId,
          numeroGuia: data.numeroGuia,
          fechaInicio: data.fechaInicio,
          direccionSuministro: data.direccionSuministro,
          estadoServicio,
          estadoCobranza,
          creadoPor: data.creadoPor,
          comunidadId: data.comunidadId,
          sectorId: data.sectorId,
          latitud: data.latitud,
          longitud: data.longitud,
        },
        include: this.defaultInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('Contrato', data.numeroGuia);
      }
      throw error;
    }
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Partial<ContractFilters>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<ContractRow[]> {
    const where = this.buildContractWhere(params.where);
    return this.prisma.contratos.findMany({
      skip: params.skip,
      take: params.take,
      where,
      orderBy: params.orderBy as Prisma.ContratosOrderByWithRelationInput,
      include: this.defaultInclude,
    });
  }

  async findUnique(where: {
    contratoId?: bigint;
    numeroGuia?: string;
  }): Promise<ContractRow | null> {
    return this.prisma.contratos.findUnique({
      where: where as Prisma.ContratosWhereUniqueInput,
      include: this.defaultInclude,
    });
  }

  async count(params?: { where?: Partial<ContractFilters> }): Promise<number> {
    const where = this.buildContractWhere(params?.where);
    return this.prisma.contratos.count({
      where,
    });
  }

  async update(
    contratoId: bigint,
    data: UpdateContractData,
  ): Promise<ContractRow> {
    try {
      return await this.prisma.contratos.update({
        where: { contratoId },
        data: data,
        include: this.defaultInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Contrato', contratoId.toString());
      }
      throw error;
    }
  }

  async softDelete(contratoId: bigint): Promise<ContractRow> {
    try {
      return await this.prisma.contratos.update({
        where: { contratoId },
        data: { deletedAt: new Date() },
        include: this.defaultInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Contrato', contratoId.toString());
      }
      throw error;
    }
  }

  // ── Domain-level transactional operations ──────────────────────────────

  async createContractWithMeterHistory(
    data: CreateContractWithMeterCommand,
  ): Promise<ContractRow> {
    return this.prisma.$transaction(async (tx) => {
      const dependencies = await this.validateContractDependencies(tx, data);

      const reserved = await tx.medidores.updateMany({
        where: {
          medidorId: data.medidorId,
          estado: EstadoMedidor.BODEGA,
          deletedAt: null,
          historial: { none: { fechaHasta: null, deletedAt: null } },
        },
        data: { estado: EstadoMedidor.PENDIENTE, fechaInstalacion: null },
      });
      if (reserved.count !== 1) {
        throw new InvalidDomainOperationException(
          'El medidor ya no está disponible en bodega',
        );
      }

      const numeroGuia = await this.contractGuideGenerator.generate(tx, {
        comunidadId: data.comunidadId,
        serieMedidor: dependencies.medidorSerie,
      });

      const contrato = await tx.contratos.create({
        data: {
          ...normalizeContractProcedure(data),
          ...(data.registradoPorId !== undefined
            ? { registradoPorId: data.registradoPorId }
            : {}),
          clienteId: data.clienteId,
          categoriaTarifaId: data.categoriaTarifaId,
          numeroGuia,
          direccionSuministro: data.direccionSuministro,
          comunidadId: data.comunidadId,
          estadoServicio: EstadoServicioContrato.PENDIENTE_INSPECCION,
          estadoCobranza: 'NO_APLICA',
          ...(data.sectorId !== null ? { sectorId: data.sectorId } : {}),
          ...(data.creadoPor ? { creadoPor: data.creadoPor } : {}),
          latitud: data.latitud,
          longitud: data.longitud,
        },
      });

      await tx.historialMedidores.create({
        data: {
          medidorId: data.medidorId,
          contratoId: contrato.contratoId,
          lecturaInicial: new Prisma.Decimal(data.lecturaInicial),
          motivo: 'VINCULACION MANUAL',
        },
      });

      await ensureContractWorkOrder(tx, contrato, data.medidorId, 'INSPECCION');

      const createdRecord = await tx.contratos.findUnique({
        where: { contratoId: contrato.contratoId },
        include: this.defaultInclude,
      });
      return createdRecord!;
    });
  }

  async finalizeActiveMeterLink(contratoId: bigint): Promise<ContractRow> {
    return this.prisma.$transaction(async (tx) => {
      const activeLink = await tx.historialMedidores.findFirst({
        where: { contratoId, fechaHasta: null },
      });

      if (!activeLink) {
        throw new InvalidDomainOperationException(
          'No hay un vínculo activo para este contrato',
        );
      }

      await tx.historialMedidores.update({
        where: { historialId: activeLink.historialId },
        data: { fechaHasta: new Date() },
      });

      const medidor = await tx.medidores.findUnique({
        where: { medidorId: activeLink.medidorId },
      });

      if (!medidor) {
        throw new EntityNotFoundException('Medidor', activeLink.medidorId);
      }

      await tx.medidores.update({
        where: { medidorId: activeLink.medidorId },
        data: {
          estado: EstadoMedidor.BAJA,
          fechaBaja: new Date(),
        },
      });

      const finalizedRecord = await tx.contratos.findUnique({
        where: { contratoId },
        include: this.defaultInclude,
      });
      return finalizedRecord!;
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private buildContractWhere(
    filters?: ContractFilters,
  ): Prisma.ContratosWhereInput {
    const conditions: Prisma.ContratosWhereInput[] = [{ deletedAt: null }];

    if (!filters) return conditions[0];

    if (filters.search) {
      conditions.push({
        OR: [
          { numeroGuia: { contains: filters.search, mode: 'insensitive' } },
          {
            direccionSuministro: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            historialMedidores: {
              some: {
                fechaHasta: null,
                medidor: {
                  serie: { contains: filters.search, mode: 'insensitive' },
                },
              },
            },
          },
          {
            categoriaTarifa: {
              nombre: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            comunidad: {
              nombre: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            sector: {
              nombre: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            cliente: {
              OR: [
                {
                  nombres: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  apellidos: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  razonSocial: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  identificacion: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ],
      });
    }

    if (filters.contratoId) {
      conditions.push({ contratoId: filters.contratoId });
    }

    if (filters.numeroGuia) {
      conditions.push({
        numeroGuia: { contains: filters.numeroGuia, mode: 'insensitive' },
      });
    }

    if (filters.categoriaTarifaId) {
      conditions.push({ categoriaTarifaId: filters.categoriaTarifaId });
    }

    if (filters.medidorId || filters.medidorSerie) {
      conditions.push({
        historialMedidores: {
          some: {
            fechaHasta: null,
            ...(filters.medidorId ? { medidorId: filters.medidorId } : {}),
            ...(filters.medidorSerie
              ? {
                  medidor: {
                    serie: {
                      contains: filters.medidorSerie,
                      mode: 'insensitive',
                    },
                  },
                }
              : {}),
          },
        },
      });
    }

    if (filters.ubicacion) {
      conditions.push({
        direccionSuministro: {
          contains: filters.ubicacion,
          mode: 'insensitive',
        },
      });
    }

    if (filters.estadoServicio) {
      conditions.push({ estadoServicio: filters.estadoServicio });
    }

    if (filters.estadoCobranza) {
      conditions.push({ estadoCobranza: filters.estadoCobranza });
    }

    if (filters.hasDebt === true) {
      conditions.push({
        prefacturas: {
          some: {
            deletedAt: null,
            estado: { in: ['GENERADA', 'EN_REVISION', 'APROBADA'] as any },
          },
        },
      });
    } else if (filters.hasDebt === false) {
      conditions.push({
        prefacturas: {
          none: {
            deletedAt: null,
            estado: { in: ['GENERADA', 'EN_REVISION', 'APROBADA'] as any },
          },
        },
      });
    }

    return conditions.length === 1 ? conditions[0] : { AND: conditions };
  }

  private async validateContractDependencies(
    tx: Prisma.TransactionClient,
    data: CreateContractWithMeterCommand,
  ): Promise<{ medidorSerie: string }> {
    const [cliente, medidor, tarifa, comunidad, sector] = await Promise.all([
      tx.clientes.findUnique({ where: { clienteId: data.clienteId } }),
      tx.medidores.findUnique({ where: { medidorId: data.medidorId } }),
      tx.categoriaTarifa.findUnique({
        where: { categoriaTarifaId: data.categoriaTarifaId },
      }),
      tx.comunidades.findUnique({ where: { comunidadId: data.comunidadId } }),
      data.sectorId !== null
        ? tx.sectores.findUnique({ where: { sectorId: data.sectorId } })
        : Promise.resolve(null),
    ]);

    if (!cliente) {
      throw new EntityNotFoundException('Cliente', data.clienteId);
    }

    if (!medidor) {
      throw new EntityNotFoundException('Medidor', data.medidorId);
    }

    if (medidor.estado !== EstadoMedidor.BODEGA) {
      throw new InvalidDomainOperationException(
        `El medidor debe estar en estado BODEGA para ser vinculado, estado actual: ${medidor.estado}`,
      );
    }

    if (!tarifa) {
      throw new EntityNotFoundException(
        'Categoría de tarifa',
        data.categoriaTarifaId,
      );
    }

    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', data.comunidadId);
    }

    if (data.sectorId !== null && !sector) {
      throw new EntityNotFoundException('Sector', data.sectorId);
    }

    return { medidorSerie: medidor.serie };
  }
}
