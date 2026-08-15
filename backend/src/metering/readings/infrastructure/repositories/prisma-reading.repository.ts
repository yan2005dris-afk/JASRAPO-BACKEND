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
import { EstadoPeriodo } from 'src/shared/enums';

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

  async updateWithCas(
    where: { lecturaId: bigint; estado: string },
    data: UpdateReadingRepositoryData,
  ): Promise<LecturaEntity | null> {
    const record = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.lecturas.updateMany({
        where: {
          lecturaId: where.lecturaId,
          estado: where.estado as any,
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
          ...(data.estado !== undefined && { estado: data.estado as any }),
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
}
