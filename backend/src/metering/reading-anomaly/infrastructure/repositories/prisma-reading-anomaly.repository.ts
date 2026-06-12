import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  ReadingAnomalyRepository,
  CreateReadingAnomalyRepositoryData,
  UpdateReadingAnomalyRepositoryData,
  ReadingAnomalyFilters,
} from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { ReadingAnomalyMapper } from '../mappers/reading-anomaly.mapper';
import { safeReadingAnomaliesSelect } from '../../types/IResponseReadingAnomaly';

@Injectable()
export class PrismaReadingAnomalyRepository
  implements ReadingAnomalyRepository
{
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

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: ReadingAnomalyFilters;
  }): Promise<ReadingAnomalyEntity[]> {
    const whereClause: Prisma.LecturaAnomaliaWhereInput = {
      deletedAt: null,
      ...(params.where?.lecturaId && { lecturaId: params.where.lecturaId }),
      ...(params.where?.tipo && { tipo: params.where.tipo }),
      ...(params.where?.estado && { estado: params.where.estado }),
    };

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
    const whereClause: Prisma.LecturaAnomaliaWhereInput = {
      deletedAt: null,
      ...(params.where?.lecturaId && { lecturaId: params.where.lecturaId }),
      ...(params.where?.tipo && { tipo: params.where.tipo }),
      ...(params.where?.estado && { estado: params.where.estado }),
    };

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
        fotoUrlMinIo: data.fotoUrlMinIo,
      },
      select: safeReadingAnomaliesSelect,
    });
    return ReadingAnomalyMapper.toDomain(record)!;
  }

  async update(
    where: { anomaliaId: bigint },
    data: UpdateReadingAnomalyRepositoryData,
  ): Promise<ReadingAnomalyEntity> {
    const record = await this.prisma.lecturaAnomalia.update({
      where: { anomaliaId: where.anomaliaId },
      data: {
        ...(data.lecturaId !== undefined && { lecturaId: data.lecturaId }),
        ...(data.observacion !== undefined && {
          observacion: data.observacion,
        }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.fotoUrlMinIo !== undefined && {
          fotoUrlMinIo: data.fotoUrlMinIo,
        }),
        ...(data.deletedAt !== undefined && { deletedAt: data.deletedAt }),
      },
      select: safeReadingAnomaliesSelect,
    });
    return ReadingAnomalyMapper.toDomain(record)!;
  }
}
