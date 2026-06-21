import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  ReadingRepository,
  CreateReadingRepositoryData,
  UpdateReadingRepositoryData,
  ReadingFilters,
} from '../../domain/repositories/reading.repository';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { ReadingMapper } from '../mappers/reading.mapper';
import { safeReadingsSelect } from '../../types/IResponseReading';

@Injectable()
export class PrismaReadingRepository implements ReadingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: {
    lecturaId: bigint;
  }): Promise<LecturaEntity | null> {
    const record = await this.prisma.lecturas.findUnique({
      where: { lecturaId: where.lecturaId },
      select: safeReadingsSelect,
    });
    return ReadingMapper.toDomain(record);
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: ReadingFilters;
  }): Promise<LecturaEntity[]> {
    const whereClause: Prisma.LecturasWhereInput = {
      deletedAt: null,
      ...(params.where?.medidorId && { medidorId: params.where.medidorId }),
      ...(params.where?.periodoId && { periodoId: params.where.periodoId }),
      ...(params.where?.contratoId && {
        medidor: {
          historial: {
            some: {
              contratoId: params.where.contratoId,
              fechaHasta: null,
            },
          },
        },
      }),
    };

    const records = await this.prisma.lecturas.findMany({
      where: whereClause,
      skip: params.skip,
      take: params.take,
      orderBy: { fecha: 'desc' },
      select: safeReadingsSelect,
    });
    return ReadingMapper.toDomainList(records);
  }

  async count(params: { where?: ReadingFilters }): Promise<number> {
    const whereClause: Prisma.LecturasWhereInput = {
      deletedAt: null,
      ...(params.where?.medidorId && { medidorId: params.where.medidorId }),
      ...(params.where?.periodoId && { periodoId: params.where.periodoId }),
      ...(params.where?.contratoId && {
        medidor: {
          historial: {
            some: {
              contratoId: params.where.contratoId,
              fechaHasta: null,
            },
          },
        },
      }),
    };

    return this.prisma.lecturas.count({ where: whereClause });
  }

  async create(data: CreateReadingRepositoryData): Promise<LecturaEntity> {
    const record = await this.prisma.lecturas.create({
      data: {
        fecha: data.fecha,
        lecturaAnterior: data.lecturaAnterior,
        lecturaActual: data.lecturaActual,
        consumoCalculado: data.consumoCalculado,
        medidorId: data.medidorId,
        descripcionAnomalia: data.descripcionAnomalia,
        fechaValidacion: data.fechaValidacion,
        fotoUrl: data.fotoUrl,
        estado: data.estado as any,
        lecturaInicial: data.lecturaInicial,
        periodoId: data.periodoId,
      },
      select: safeReadingsSelect,
    });
    return ReadingMapper.toDomain(record)!;
  }

  async update(
    where: { lecturaId: bigint },
    data: UpdateReadingRepositoryData,
  ): Promise<LecturaEntity> {
    const record = await this.prisma.lecturas.update({
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
        ...(data.estado !== undefined && { estado: data.estado as any }),
        ...(data.lecturaInicial !== undefined && {
          lecturaInicial: data.lecturaInicial,
        }),
        ...(data.periodoId !== undefined && { periodoId: data.periodoId }),
        ...(data.deletedAt !== undefined && { deletedAt: data.deletedAt }),
      },
      select: safeReadingsSelect,
    });
    return ReadingMapper.toDomain(record)!;
  }
}
