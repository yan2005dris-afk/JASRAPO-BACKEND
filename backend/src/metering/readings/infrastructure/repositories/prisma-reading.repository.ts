import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, $Enums } from 'src/generated/prisma/client';
import {
  ReadingRepository,
  UpdateReadingRepositoryData,
  ReadingFilters,
  ReadingSnapshot,
} from '../../domain/repositories/reading.repository';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { ReadingMapper } from '../mappers/reading.mapper';
import { EstadoPeriodo, EstadoLectura } from 'src/shared/enums';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import { Decimal } from 'decimal.js';

export const safeReadingsSelect = {
  lecturaId: true,
  fecha: true,
  lecturaAnterior: true,
  lecturaActual: true,
  consumoCalculado: true,
  descripcionAnomalia: true,
  fechaValidacion: true,
  lecturaInicial: true,
  periodoId: true,
  estado: true,
  deletedAt: true,
  medidor: {
    select: {
      medidorId: true,
      serie: true,
      marca: true,
      modelo: true,
      historial: {
        where: { fechaHasta: null },
        select: {
          contrato: {
            select: {
              contratoId: true,
              numeroGuia: true,
              direccionSuministro: true,
              estadoServicio: true,
              sector: {
                select: {
                  nombre: true,
                },
              },
              cliente: {
                select: {
                  clienteId: true,
                  nombres: true,
                  apellidos: true,
                  razonSocial: true,
                  identificacion: true,
                },
              },
            },
          },
        },
      },
    },
  },
  periodoRel: {
    select: {
      periodoId: true,
      nombre: true,
      fechaInicio: true,
      fechaFin: true,
    },
  },
  ordenesTrabajo: {
    where: { deletedAt: null },
    select: { evidenciaFotoUrl: true },
    orderBy: { updatedAt: 'desc' },
  },
} satisfies Prisma.LecturasSelect;

@Injectable()
export class PrismaReadingRepository implements ReadingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActivePeriod(): Promise<{ periodoId: number } | null> {
    return this.prisma.periodos.findFirst({
      where: { estado: EstadoPeriodo.ABIERTO },
      select: { periodoId: true },
    });
  }

  /**
   * Resuelve el snapshot histórico (lecturaAnterior y lecturaInicial) para un medidor
   * en la fecha objetivo, considerando la asignación al contrato y preservando precisión Decimal.
   */
  async findReadingSnapshot(
    medidorId: bigint,
    fecha: Date,
    txClient?: Prisma.TransactionClient,
  ): Promise<ReadingSnapshot | null> {
    const client = txClient ?? this.prisma;

    // 1. Buscar asignación histórica vigente en la fecha de la lectura
    let history = await client.historialMedidores.findFirst({
      where: {
        medidorId,
        deletedAt: null,
        fechaDesde: { lte: fecha },
        OR: [{ fechaHasta: null }, { fechaHasta: { gte: fecha } }],
      },
      orderBy: { fechaDesde: 'desc' },
      select: {
        historialId: true,
        fechaDesde: true,
        lecturaInicial: true,
      },
    });

    if (!history) {
      // Fallback: Si no hay historial con fechaDesde <= fecha, buscar la asignación activa
      history = await client.historialMedidores.findFirst({
        where: {
          medidorId,
          fechaHasta: null,
          deletedAt: null,
        },
        orderBy: { fechaDesde: 'desc' },
        select: {
          historialId: true,
          fechaDesde: true,
          lecturaInicial: true,
        },
      });

      if (!history) {
        return null;
      }
    }

    // 2. Buscar última lectura aprobada estrictamente anterior dentro de la misma asignación
    const lastApproved = await client.lecturas.findFirst({
      where: {
        medidorId,
        estado: EstadoLectura.APROBADA,
        deletedAt: null,
        fecha: {
          lt: fecha,
          gte: history.fechaDesde,
        },
      },
      orderBy: { fecha: 'desc' },
      select: { lecturaActual: true },
    });

    if (lastApproved) {
      return {
        lecturaAnterior: new Decimal(lastApproved.lecturaActual.toString()),
        lecturaInicial: false,
      };
    }

    return {
      lecturaAnterior: new Decimal(history.lecturaInicial.toString()),
      lecturaInicial: true,
    };
  }

  async findLastApprovedActualByMeter(
    medidorId: bigint,
    fecha?: Date,
  ): Promise<Decimal | null> {
    const reading = await this.prisma.lecturas.findFirst({
      where: {
        medidorId,
        estado: EstadoLectura.APROBADA,
        deletedAt: null,
        ...(fecha && { fecha: { lt: fecha } }),
      },
      orderBy: { fecha: 'desc' },
      select: { lecturaActual: true },
    });
    if (!reading) {
      return null;
    }
    return new Decimal(reading.lecturaActual.toString());
  }

  async findActiveInitialReadingByMeter(
    medidorId: bigint,
    fecha?: Date,
  ): Promise<Decimal | null> {
    const history = await this.prisma.historialMedidores.findFirst({
      where: {
        medidorId,
        deletedAt: null,
        ...(fecha
          ? {
              fechaDesde: { lte: fecha },
              OR: [{ fechaHasta: null }, { fechaHasta: { gte: fecha } }],
            }
          : { fechaHasta: null }),
      },
      orderBy: { fechaDesde: 'desc' },
      select: { lecturaInicial: true },
    });
    if (!history) {
      return null;
    }
    return new Decimal(history.lecturaInicial.toString());
  }

  async findUnique(where: {
    lecturaId: bigint;
  }): Promise<LecturaEntity | null> {
    const record = await this.prisma.lecturas.findUnique({
      where: { lecturaId: where.lecturaId },
      select: safeReadingsSelect,
    });
    return ReadingMapper.toDomain(record);
  }

  private buildWhereClause(
    filters?: ReadingFilters,
  ): Prisma.LecturasWhereInput {
    const whereClause: Prisma.LecturasWhereInput = {
      deletedAt: null,
      ...(filters?.medidorId && { medidorId: filters.medidorId }),
      ...(filters?.periodoId && { periodoId: filters.periodoId }),
      ...(filters?.estado && {
        estado: filters.estado as EstadoLectura,
      }),
      ...(filters?.contratoId && {
        medidor: {
          historial: {
            some: {
              contratoId: filters.contratoId,
              fechaHasta: null,
            },
          },
        },
      }),
    };

    if (filters?.search) {
      const search = filters.search.trim();
      whereClause.OR = [
        {
          medidor: {
            serie: { contains: search, mode: 'insensitive' },
          },
        },
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: {
                  OR: [
                    { numeroGuia: { contains: search, mode: 'insensitive' } },
                    {
                      cliente: {
                        nombres: { contains: search, mode: 'insensitive' },
                      },
                    },
                    {
                      cliente: {
                        apellidos: { contains: search, mode: 'insensitive' },
                      },
                    },
                    {
                      cliente: {
                        razonSocial: { contains: search, mode: 'insensitive' },
                      },
                    },
                    {
                      cliente: {
                        identificacion: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ];
    }

    return whereClause;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: ReadingFilters;
  }): Promise<LecturaEntity[]> {
    const records = await this.prisma.lecturas.findMany({
      where: this.buildWhereClause(params.where),
      skip: params.skip,
      take: params.take,
      orderBy: { fecha: 'desc' },
      select: safeReadingsSelect,
    });
    return ReadingMapper.toDomainList(records);
  }

  async count(params: { where?: ReadingFilters }): Promise<number> {
    return this.prisma.lecturas.count({
      where: this.buildWhereClause(params.where),
    });
  }

  async update(
    where: { lecturaId: bigint },
    data: UpdateReadingRepositoryData,
  ): Promise<LecturaEntity> {
    const record = await this.prisma.$transaction(async (tx) => {
      if (data.evidenciaFotoUrl !== undefined) {
        const linked = await tx.ordenesTrabajo.updateMany({
          where: { lecturaId: where.lecturaId, deletedAt: null },
          data: { evidenciaFotoUrl: data.evidenciaFotoUrl },
        });
        if (linked.count === 0) {
          throw new InvalidDomainOperationException(
            'La lectura no tiene una orden de trabajo vinculada para guardar la evidencia fotográfica',
          );
        }
      }

      const updated = await tx.lecturas.update({
        where: { lecturaId: where.lecturaId },
        data: {
          ...(data.fecha !== undefined && { fecha: data.fecha }),
          ...(data.lecturaAnterior !== undefined && {
            lecturaAnterior: data.lecturaAnterior,
          }),
          ...(data.lecturaActual !== undefined && {
            lecturaActual: data.lecturaActual,
          }),
          ...(data.consumoCalculado !== undefined && {
            consumoCalculado: data.consumoCalculado,
          }),
          ...(data.medidorId !== undefined && { medidorId: data.medidorId }),
          ...(data.descripcionAnomalia !== undefined && {
            descripcionAnomalia: data.descripcionAnomalia,
          }),
          ...(data.fechaValidacion !== undefined && {
            fechaValidacion: data.fechaValidacion,
          }),
          ...(data.estado !== undefined && {
            estado: data.estado as $Enums.EstadoLectura,
          }),
          ...(data.lecturaInicial !== undefined && {
            lecturaInicial: data.lecturaInicial,
          }),
          ...(data.periodoId !== undefined && { periodoId: data.periodoId }),
          ...(data.deletedAt !== undefined && { deletedAt: data.deletedAt }),
        },
        select: safeReadingsSelect,
      });

      // Si la lectura se marca como CON_NOVEDAD, registrar o actualizar la novedad
      if (data.estado === 'CON_NOVEDAD') {
        const workOrder = await tx.ordenesTrabajo.findFirst({
          where: { lecturaId: where.lecturaId, deletedAt: null },
          select: { ordenTrabajoId: true },
        });

        if (workOrder) {
          const existingNovelty = await tx.novedadOrdenTrabajo.findFirst({
            where: {
              ordenTrabajoId: workOrder.ordenTrabajoId,
              deletedAt: null,
            },
          });

          if (!existingNovelty) {
            await tx.novedadOrdenTrabajo.create({
              data: {
                ordenTrabajoId: workOrder.ordenTrabajoId,
                lecturaId: where.lecturaId,
                tipo: $Enums.TipoAnomalia.OTRO,
                estado: $Enums.EstadoNovedad.OPEN,
                observacion:
                  data.descripcionAnomalia ||
                  'Novedad reportada desde ruta de lectura',
                fotoUrl: null,
              },
            });
          } else if (
            existingNovelty.estado !== $Enums.EstadoNovedad.OPEN &&
            existingNovelty.estado !== $Enums.EstadoNovedad.IN_PROGRESS
          ) {
            await tx.novedadOrdenTrabajo.update({
              where: { novedadId: existingNovelty.novedadId },
              data: { estado: $Enums.EstadoNovedad.OPEN },
            });
          }
        }
      }

      return updated;
    });

    return ReadingMapper.toDomain(record)!;
  }

  async updateWithCas(
    where: { lecturaId: bigint; estado: string },
    data: UpdateReadingRepositoryData,
  ): Promise<LecturaEntity | null> {
    const record = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.lecturas.updateMany({
        where: {
          lecturaId: where.lecturaId,
          estado: where.estado as $Enums.EstadoLectura,
          deletedAt: null,
        },
        data: {
          ...(data.fecha !== undefined && { fecha: data.fecha }),
          ...(data.lecturaAnterior !== undefined && {
            lecturaAnterior: data.lecturaAnterior,
          }),
          ...(data.lecturaActual !== undefined && {
            lecturaActual: data.lecturaActual,
          }),
          ...(data.consumoCalculado !== undefined && {
            consumoCalculado: data.consumoCalculado,
          }),
          ...(data.medidorId !== undefined && { medidorId: data.medidorId }),
          ...(data.descripcionAnomalia !== undefined && {
            descripcionAnomalia: data.descripcionAnomalia,
          }),
          ...(data.fechaValidacion !== undefined && {
            fechaValidacion: data.fechaValidacion,
          }),
          ...(data.estado !== undefined && {
            estado: data.estado as $Enums.EstadoLectura,
          }),
          ...(data.lecturaInicial !== undefined && {
            lecturaInicial: data.lecturaInicial,
          }),
          ...(data.periodoId !== undefined && { periodoId: data.periodoId }),
          ...(data.deletedAt !== undefined && { deletedAt: data.deletedAt }),
        },
      });

      if (count === 0) {
        return null;
      }

      if (data.evidenciaFotoUrl !== undefined) {
        const linked = await tx.ordenesTrabajo.updateMany({
          where: { lecturaId: where.lecturaId, deletedAt: null },
          data: { evidenciaFotoUrl: data.evidenciaFotoUrl },
        });
        if (linked.count === 0) {
          throw new InvalidDomainOperationException(
            'La lectura no tiene una orden de trabajo vinculada para guardar la evidencia fotográfica',
          );
        }
      }

      return tx.lecturas.findUnique({
        where: { lecturaId: where.lecturaId },
        select: safeReadingsSelect,
      });
    });

    return ReadingMapper.toDomain(record);
  }

  async isReadingLinkedToReplacement(lecturaId: bigint): Promise<boolean> {
    const count = await this.prisma.reemplazoMedidor.count({
      where: {
        OR: [
          { lecturaFinalSalienteId: lecturaId },
          { lecturaInicialEntranteId: lecturaId },
        ],
        deletedAt: null,
      },
    });
    return count > 0;
  }
}
