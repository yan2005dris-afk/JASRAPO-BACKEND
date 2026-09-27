import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { PeriodEntity } from '../../domain/entities/period.entity';
import { PeriodMapper } from '../mappers/period.mapper';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type {
  CreatePeriodData,
  UpdatePeriodData,
  PeriodFilters,
  PeriodRelationCounts,
} from '../../domain/types/period.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaPeriodRepository implements PeriodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePeriodData): Promise<PeriodEntity> {
    try {
      const prismaInput = PeriodMapper.toPrismaCreateInput(data);
      const record = await this.prisma.periodos.create({
        data: prismaInput,
      });
      return PeriodMapper.toDomain(record)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'Periodo',
          'nombre',
          data.nombre,
        );
      }
      throw error;
    }
  }

  async findAll(
    filters?: PeriodFilters,
    pagination: PaginateOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<PeriodEntity>> {
    const page = Math.max(1, Number(pagination.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
    const skip = (page - 1) * limit;

    const where = PeriodMapper.toPrismaWhereInput(filters);

    const [total, records] = await Promise.all([
      this.prisma.periodos.count({ where }),
      this.prisma.periodos.findMany({
        where,
        orderBy: { fechaInicio: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: PeriodMapper.toDomainList(records),
      meta: {
        total,
        page,
        limit,
        ultimaPagina: totalPages,
        paginaActual: page,
        porPagina: limit,
        anterior: page > 1 ? page - 1 : null,
        siguiente: page < totalPages ? page + 1 : null,
      },
    };
  }

  async findById(id: number): Promise<PeriodEntity | null> {
    const record = await this.prisma.periodos.findUnique({
      where: { periodoId: id },
    });
    return PeriodMapper.toDomain(record);
  }

  async findByName(nombre: string): Promise<PeriodEntity | null> {
    const record = await this.prisma.periodos.findUnique({
      where: { nombre: nombre.trim() },
    });
    return PeriodMapper.toDomain(record);
  }

  async findByNames(nombres: string[]): Promise<PeriodEntity[]> {
    if (nombres.length === 0) return [];
    const trimmed = nombres.map((n) => n.trim());
    const records = await this.prisma.periodos.findMany({
      where: { nombre: { in: trimmed } },
    });
    return records.map((r) => PeriodMapper.toDomain(r)!);
  }

  async findOverlapping(
    fechaInicio: Date,
    fechaFin: Date,
    excludeId?: number,
  ): Promise<PeriodEntity | null> {
    const where: Prisma.PeriodosWhereInput = {
      AND: [
        excludeId !== undefined ? { periodoId: { not: excludeId } } : {},
        { fechaInicio: { lte: fechaFin } },
        { fechaFin: { gte: fechaInicio } },
      ],
    };

    const record = await this.prisma.periodos.findFirst({
      where,
      orderBy: { fechaInicio: 'asc' },
    });

    return PeriodMapper.toDomain(record);
  }

  async createBatch(data: CreatePeriodData[]): Promise<PeriodEntity[]> {
    if (data.length === 0) return [];
    try {
      return await this.prisma.$transaction(async (tx) => {
        const results: PeriodEntity[] = [];
        for (const item of data) {
          const prismaInput = PeriodMapper.toPrismaCreateInput(item);
          const record = await tx.periodos.create({
            data: prismaInput,
          });
          results.push(PeriodMapper.toDomain(record)!);
        }
        return results;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'Periodo',
          'nombre',
          'Conflicto de nombre único en lote',
        );
      }
      throw error;
    }
  }

  async update(id: number, data: UpdatePeriodData): Promise<PeriodEntity> {
    try {
      const prismaInput = PeriodMapper.toPrismaUpdateInput(data);
      const record = await this.prisma.periodos.update({
        where: { periodoId: id },
        data: prismaInput,
      });
      return PeriodMapper.toDomain(record)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Periodo', id);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'Periodo',
          'nombre',
          data.nombre ?? id.toString(),
        );
      }
      throw error;
    }
  }

  async delete(id: number): Promise<PeriodEntity> {
    try {
      const record = await this.prisma.periodos.delete({
        where: { periodoId: id },
      });
      return PeriodMapper.toDomain(record)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Periodo', id);
      }
      throw error;
    }
  }

  async countRelations(id: number): Promise<PeriodRelationCounts> {
    const record = await this.prisma.periodos.findUnique({
      where: { periodoId: id },
      select: {
        _count: {
          select: {
            lecturas: true,
            prefacturas: true,
            lotes: true,
            rutas: true,
          },
        },
      },
    });

    if (!record) {
      return {
        lecturas: 0,
        prefacturas: 0,
        lotes: 0,
        rutas: 0,
      };
    }

    return {
      lecturas: record._count.lecturas,
      prefacturas: record._count.prefacturas,
      lotes: record._count.lotes,
      rutas: record._count.rutas,
    };
  }
}
