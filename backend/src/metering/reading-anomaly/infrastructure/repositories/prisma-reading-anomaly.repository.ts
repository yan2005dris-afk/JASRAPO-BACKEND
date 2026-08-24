import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  ReadingAnomalyRepository,
  CreateReadingAnomalyRepositoryData,
  UpdateReadingAnomalyRepositoryData,
  ReadingAnomalyFilters,
} from '../../domain/repositories/reading-anomaly.repository';
import { EstadoLectura } from 'src/shared/enums';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { ReadingAnomalyMapper } from '../mappers/reading-anomaly.mapper';

export const safeReadingAnomaliesSelect = {
  anomaliaId: true,
  lecturaId: true,
  observacion: true,
  tipo: true,
  estado: true,
  fotoUrl: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  lectura: {
    select: {
      lecturaId: true,
      fecha: true,
      lecturaActual: true,
      consumoCalculado: true,
    },
  },
} satisfies Prisma.LecturaAnomaliaSelect;

@Injectable()
export class PrismaReadingAnomalyRepository implements ReadingAnomalyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: {
    anomaliaId: bigint;
  }): Promise<ReadingAnomalyEntity | null> {
    const record = await this.prisma.lecturaAnomalia.findUnique({
      where: { anomaliaId: where.anomaliaId },
      select: safeReadingAnomaliesSelect,
    });
    return ReadingAnomalyMapper.toDomain(record);
  }

  private buildWhereClause(
    filters?: ReadingAnomalyFilters,
  ): Prisma.LecturaAnomaliaWhereInput {
    const whereClause: Prisma.LecturaAnomaliaWhereInput = {
      deletedAt: null,
      ...(filters?.lecturaId && { lecturaId: filters.lecturaId }),
      ...(filters?.tipo && { tipo: filters.tipo }),
      ...(filters?.estado && { estado: filters.estado }),
    };

    if (filters?.search) {
      const search = filters.search.trim();
      whereClause.OR = [
        { observacion: { contains: search, mode: 'insensitive' } },
        {
          lectura: {
            OR: [
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
                          {
                            numeroGuia: {
                              contains: search,
                              mode: 'insensitive',
                            },
                          },
                          {
                            cliente: {
                              nombres: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                          },
                          {
                            cliente: {
                              apellidos: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                          },
                          {
                            cliente: {
                              razonSocial: {
                                contains: search,
                                mode: 'insensitive',
                              },
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
            ],
          },
        },
      ];

      const numericId = /^\d+$/.test(search) ? BigInt(search) : null;
      if (numericId !== null) {
        whereClause.OR.push(
          { anomaliaId: numericId },
          { lecturaId: numericId },
        );
      }
    }

    return whereClause;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: ReadingAnomalyFilters;
  }): Promise<ReadingAnomalyEntity[]> {
    const whereClause = this.buildWhereClause(params.where);

    const records = await this.prisma.lecturaAnomalia.findMany({
      where: whereClause,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
      select: safeReadingAnomaliesSelect,
    });
    return ReadingAnomalyMapper.toDomainList(records);
  }

  async count(params: { where?: ReadingAnomalyFilters }): Promise<number> {
    const whereClause = this.buildWhereClause(params.where);

    return this.prisma.lecturaAnomalia.count({ where: whereClause });
  }

  async create(
    data: CreateReadingAnomalyRepositoryData,
  ): Promise<ReadingAnomalyEntity> {
    const record = await this.prisma.lecturaAnomalia.create({
      data: {
        lecturaId: data.lecturaId,
        observacion: data.observacion,
        tipo: data.tipo,
        estado: data.estado,
        fotoUrl: data.fotoUrl,
      },
      select: safeReadingAnomaliesSelect,
    });
    return ReadingAnomalyMapper.toDomain(record)!;
  }

  async createAndMarkReadingWithAnomaly(
    data: CreateReadingAnomalyRepositoryData & {
      nextEstadoLectura: EstadoLectura;
    },
  ): Promise<ReadingAnomalyEntity> {
    const { nextEstadoLectura, ...createData } = data;

    const result = await this.prisma.$transaction(async (tx) => {
      const anomaly = await tx.lecturaAnomalia.create({
        data: {
          lecturaId: createData.lecturaId,
          observacion: createData.observacion,
          tipo: createData.tipo,
          estado: createData.estado,
          fotoUrl: createData.fotoUrl,
        },
        select: safeReadingAnomaliesSelect,
      });

      await tx.lecturas.update({
        where: { lecturaId: createData.lecturaId },
        data: { estado: nextEstadoLectura },
      });

      return anomaly;
    });

    return ReadingAnomalyMapper.toDomain(result)!;
  }

  async update(
    where: { anomaliaId: bigint },
    data: UpdateReadingAnomalyRepositoryData,
  ): Promise<ReadingAnomalyEntity> {
    const record = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.lecturaAnomalia.update({
        where: { anomaliaId: where.anomaliaId },
        data: {
          ...(data.lecturaId !== undefined && { lecturaId: data.lecturaId }),
          ...(data.observacion !== undefined && {
            observacion: data.observacion,
          }),
          ...(data.tipo !== undefined && { tipo: data.tipo }),
          ...(data.estado !== undefined && { estado: data.estado }),
          ...(data.fotoUrl !== undefined && {
            fotoUrl: data.fotoUrl,
          }),
          ...(data.deletedAt !== undefined && { deletedAt: data.deletedAt }),
        },
        select: safeReadingAnomaliesSelect,
      });

      // Si la anomalía se marca como RESUELTA, actualizar la lectura a APROBADA
      if (data.estado === 'RESUELTA') {
        await tx.lecturas.update({
          where: { lecturaId: updated.lecturaId },
          data: { estado: EstadoLectura.APROBADA },
        });
      } else if (data.estado === 'DESCARTADA') {
        await tx.lecturas.update({
          where: { lecturaId: updated.lecturaId },
          data: { estado: EstadoLectura.PENDIENTE },
        });
      }

      return updated;
    });

    return ReadingAnomalyMapper.toDomain(record)!;
  }
}
