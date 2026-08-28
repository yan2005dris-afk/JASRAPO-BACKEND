import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, $Enums } from 'src/generated/prisma/client';
import {
  ReadingRepository,
  CreateReadingRepositoryData,
  UpdateReadingRepositoryData,
  ReadingFilters,
  ReadingSnapshot,
} from '../../domain/repositories/reading.repository';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { ReadingMapper } from '../mappers/reading.mapper';
import { EstadoPeriodo, EstadoLectura } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

import { Decimal } from 'decimal.js';

export const safeReadingsSelect = {
  lecturaId: true,
  fecha: true,
  lecturaAnterior: true,
  lecturaActual: true,
  consumoCalculado: true,
  descripcionAnomalia: true,
  fechaValidacion: true,
  fotoUrl: true,
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
              estado: true,
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

  async create(data: CreateReadingRepositoryData): Promise<LecturaEntity> {
    const estado =
      data.estado ??
      (data.descripcionAnomalia
        ? EstadoLectura.CON_NOVEDAD
        : EstadoLectura.POR_REVISION);

    const record = await this.prisma.$transaction(async (tx) => {
      const created = await tx.lecturas.create({
        data: {
          fecha: data.fecha,
          lecturaAnterior: data.lecturaAnterior,
          lecturaActual: data.lecturaActual,
          consumoCalculado: data.consumoCalculado,
          medidorId: data.medidorId,
          descripcionAnomalia: data.descripcionAnomalia,
          fechaValidacion: data.fechaValidacion,
          fotoUrl: data.fotoUrl,
          estado: estado as $Enums.EstadoLectura,
          lecturaInicial: data.lecturaInicial,
          periodoId: data.periodoId,
        },
        select: safeReadingsSelect,
      });

      if (estado === EstadoLectura.CON_NOVEDAD) {
        await tx.lecturaAnomalia.create({
          data: {
            lecturaId: created.lecturaId,
            tipo: $Enums.TipoAnomalia.OTRO,
            estado: $Enums.EstadoAnomalia.PENDIENTE,
            observacion:
              data.descripcionAnomalia ||
              'Novedad reportada desde ruta de lectura',
            fotoUrl: data.fotoUrl || null,
          },
        });
      }

      return created;
    });

    return ReadingMapper.toDomain(record)!;
  }

  /**
   * Operación atómica: resuelve el snapshot temporal y persiste la lectura en una sola transacción.
   */
  async createWithAtomicSnapshot(params: {
    fecha: Date;
    lecturaActual: Decimal;
    medidorId: bigint;
    periodoId: number;
    descripcionAnomalia?: string | null;
    fotoUrl?: string | null;
    estado?: string;
  }): Promise<LecturaEntity> {
    const record = await this.prisma.$transaction(async (tx) => {
      const snapshot = await this.findReadingSnapshot(
        params.medidorId,
        params.fecha,
        tx,
      );

      if (!snapshot) {
        throw new EntityNotFoundException(
          'HistorialMedidores',
          params.medidorId.toString(),
        );
      }

      const consumoCalculado = params.lecturaActual.minus(
        snapshot.lecturaAnterior,
      );

      // Domain invariant: Rechazar consumo negativo si no hay anomalía explícita
      if (consumoCalculado.isNegative()) {
        const hasAnomaly =
          params.descripcionAnomalia &&
          params.descripcionAnomalia.trim().length > 0;
        if (!hasAnomaly) {
          throw new InvalidDomainOperationException(
            `La lectura actual (${params.lecturaActual.toString()}) no puede ser menor a la lectura anterior (${snapshot.lecturaAnterior.toString()}) sin registrar una anomalía o novedad`,
          );
        }
      }

      let estado = params.estado ?? EstadoLectura.POR_REVISION;
      if (
        params.descripcionAnomalia &&
        params.descripcionAnomalia.trim().length > 0
      ) {
        estado = EstadoLectura.CON_NOVEDAD;
      }

      const created = await tx.lecturas.create({
        data: {
          fecha: params.fecha,
          lecturaAnterior: new Prisma.Decimal(
            snapshot.lecturaAnterior.toString(),
          ),
          lecturaActual: new Prisma.Decimal(params.lecturaActual.toString()),
          consumoCalculado: new Prisma.Decimal(consumoCalculado.toString()),
          medidorId: params.medidorId,
          descripcionAnomalia: params.descripcionAnomalia,
          fotoUrl: params.fotoUrl,
          estado: estado as $Enums.EstadoLectura,
          lecturaInicial: snapshot.lecturaInicial,
          periodoId: params.periodoId,
        },
        select: safeReadingsSelect,
      });

      if (estado === EstadoLectura.CON_NOVEDAD) {
        await tx.lecturaAnomalia.create({
          data: {
            lecturaId: created.lecturaId,
            tipo: $Enums.TipoAnomalia.OTRO,
            estado: $Enums.EstadoAnomalia.PENDIENTE,
            observacion:
              params.descripcionAnomalia ||
              'Novedad reportada desde ruta de lectura',
            fotoUrl: params.fotoUrl || null,
          },
        });
      }

      return created;
    });

    return ReadingMapper.toDomain(record)!;
  }

  async update(
    where: { lecturaId: bigint },
    data: UpdateReadingRepositoryData,
  ): Promise<LecturaEntity> {
    const record = await this.prisma.$transaction(async (tx) => {
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
          ...(data.fotoUrl !== undefined && {
            fotoUrl: data.fotoUrl,
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

      // Si la lectura se marca como CON_NOVEDAD, garantizar que exista en lectura_anomalia
      if (data.estado === 'CON_NOVEDAD') {
        const existingAnomaly = await tx.lecturaAnomalia.findFirst({
          where: {
            lecturaId: where.lecturaId,
            deletedAt: null,
          },
        });

        if (!existingAnomaly) {
          await tx.lecturaAnomalia.create({
            data: {
              lecturaId: where.lecturaId,
              tipo: $Enums.TipoAnomalia.OTRO,
              estado: $Enums.EstadoAnomalia.PENDIENTE,
              observacion:
                data.descripcionAnomalia ||
                'Novedad reportada desde ruta de lectura',
              fotoUrl: data.fotoUrl || null,
            },
          });
        } else if (
          existingAnomaly.estado !== $Enums.EstadoAnomalia.PENDIENTE &&
          existingAnomaly.estado !== $Enums.EstadoAnomalia.EN_REVISION
        ) {
          await tx.lecturaAnomalia.update({
            where: { anomaliaId: existingAnomaly.anomaliaId },
            data: { estado: $Enums.EstadoAnomalia.PENDIENTE },
          });
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
          ...(data.fotoUrl !== undefined && {
            fotoUrl: data.fotoUrl,
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

  async findRouteStateByReadingId(lecturaId: bigint): Promise<string | null> {
    const orden = await this.prisma.ordenesTrabajo.findFirst({
      where: {
        lecturaId,
        tipoActividad: 'LECTURA',
        deletedAt: null,
      },
      select: { ruta: { select: { estado: true } } },
    });
    return orden?.ruta?.estado ?? null;
  }
}
