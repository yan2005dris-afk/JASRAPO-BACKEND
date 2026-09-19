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
import { ContractEntity } from '../../domain/entities/contract.entity';
import type {
  CreateContractData,
  CreateContractWithMeterCommand,
  UpdateContractData,
  ContractFilters,
} from '../../domain/types/contract.types';
import { ContractMapper } from '../mappers/contract.mapper';
import { ContractState } from '../../domain/contract-state';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';

export const contractDefaultInclude = {
  categoriaTarifa: true,
  cliente: true,
  comunidad: true,
  sector: true,
  historialMedidores: {
    include: {
      medidor: {
        include: {
          lecturas: {
            where: { estado: 'APROBADA', deletedAt: null },
            orderBy: [{ fecha: 'desc' }, { lecturaId: 'desc' }],
            take: 1,
          },
        },
      },
    },
  },
  convenios: {
    where: {
      deletedAt: null,
      estado: { in: ['ACTIVO', 'PENDIENTE_ABONO'] },
    },
    select: { convenioId: true },
    take: 1,
  },
  // Orden de instalación activa (para exponer la asignación actual al front).
  ordenesTrabajo: {
    where: {
      deletedAt: null,
      estado: { notIn: ['CANCELADA', 'FALLIDA'] },
      ruta: { tipoActividad: { codigo: 'INSTALACION' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
    select: {
      ordenTrabajoId: true,
      estado: true,
      ruta: {
        select: {
          rutaId: true,
          nombre: true,
          estado: true,
          fechaPlanificada: true,
          operario: { select: { nombres: true, apellidos: true } },
        },
      },
    },
  },
} satisfies Prisma.ContratosInclude;

export type ContractRecord = Prisma.ContratosGetPayload<{
  include: typeof contractDefaultInclude;
}>;

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  private readonly defaultInclude = contractDefaultInclude;

  constructor(private readonly prisma: PrismaService) {}

  async findById(
    contratoId: bigint,
    includeDeleted: boolean = false,
  ): Promise<ContractEntity | null> {
    const record = await this.prisma.contratos.findFirst({
      where: {
        contratoId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record);
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
  ): Promise<PaginatedResult<ContractEntity>> {
    const where = this.buildContractWhere(args.filters);

    const result = await paginate<any>(
      this.prisma.contratos,
      {
        where,
        orderBy: args.orderBy as Prisma.ContratosOrderByWithRelationInput,
        include: this.defaultInclude,
      },
      pagination,
    );

    return {
      data: ContractMapper.toDomainList(result.data),
      meta: result.meta,
    };
  }

  async create(data: CreateContractData): Promise<ContractEntity> {
    const estadoServicio =
      data.estadoServicio ?? EstadoServicioContrato.PENDIENTE_PAGO;
    const estadoCobranza = ContractState.normalizeCollectionStatus(
      data.estadoCobranza,
      estadoServicio,
    );
    try {
      const record = await this.prisma.contratos.create({
        data: {
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
        },
        include: this.defaultInclude,
      });
      return ContractMapper.toDomain(record)!;
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
  }): Promise<ContractEntity[]> {
    const where = this.buildContractWhere(params.where);
    const records = await this.prisma.contratos.findMany({
      skip: params.skip,
      take: params.take,
      where,
      orderBy: params.orderBy as Prisma.ContratosOrderByWithRelationInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomainList(records);
  }

  async findUnique(where: {
    contratoId?: bigint;
    numeroGuia?: string;
  }): Promise<ContractEntity | null> {
    const record = await this.prisma.contratos.findUnique({
      where: where as Prisma.ContratosWhereUniqueInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record);
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
  ): Promise<ContractEntity> {
    try {
      const record = await this.prisma.contratos.update({
        where: { contratoId },
        data: data,
        include: this.defaultInclude,
      });
      return ContractMapper.toDomain(record)!;
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

  async softDelete(contratoId: bigint): Promise<ContractEntity> {
    try {
      const record = await this.prisma.contratos.update({
        where: { contratoId },
        data: { deletedAt: new Date() },
        include: this.defaultInclude,
      });
      return ContractMapper.toDomain(record)!;
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
  ): Promise<ContractEntity> {
    const estadoCobranza = ContractState.normalizeCollectionStatus(
      data.estadoCobranza,
      data.estadoServicio,
    );

    return this.prisma.$transaction(async (tx) => {
      await this.validateContractDependencies(tx, data);

      const contrato = await tx.contratos.create({
        data: {
          clienteId: data.clienteId,
          categoriaTarifaId: data.categoriaTarifaId,
          numeroGuia: data.numeroGuia,
          direccionSuministro: data.direccionSuministro,
          comunidadId: data.comunidadId,
          estadoServicio: data.estadoServicio,
          estadoCobranza,
          ...(data.sectorId !== null ? { sectorId: data.sectorId } : {}),
          ...(data.creadoPor ? { creadoPor: data.creadoPor } : {}),
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

      await tx.medidores.update({
        where: { medidorId: data.medidorId },
        data: { estado: EstadoMedidor.PENDIENTE },
      });

      if (contrato.estadoServicio === 'PENDIENTE_PAGO') {
        await tx.$executeRaw`SELECT generar_prefactura_instalacion(${contrato.contratoId}, ${data.creadoPor || 'SYSTEM'})`;
      }

      const createdRecord = await tx.contratos.findUnique({
        where: { contratoId: contrato.contratoId },
        include: this.defaultInclude,
      });
      return ContractMapper.toDomain(createdRecord)!;
    });
  }

  async finalizeActiveMeterLink(contratoId: bigint): Promise<ContractEntity> {
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
      return ContractMapper.toDomain(finalizedRecord)!;
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
  ): Promise<void> {
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
  }
}
