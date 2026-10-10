import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EstadoPeriodo } from 'src/shared/enums';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { periodInclude, type PeriodRow } from './period.include';
import type {
  CreatePeriodData,
  UpdatePeriodData,
  PeriodFilters,
  PeriodRelationCounts,
} from '../../domain/types/period.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';
import { DateUtil } from 'src/shared/utils/date.util';

@Injectable()
export class PrismaPeriodRepository implements PeriodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePeriodData): Promise<PeriodRow> {
    try {
      return await this.prisma.periodos.create({
        data: this.toCreateInput(data),
        include: periodInclude,
      });
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
  ): Promise<PaginatedResult<PeriodRow>> {
    const page = Math.max(1, Number(pagination.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
    const skip = (page - 1) * limit;

    const where = this.toWhereInput(filters);

    const [total, records] = await Promise.all([
      this.prisma.periodos.count({ where }),
      this.prisma.periodos.findMany({
        where,
        orderBy: { fechaInicio: 'desc' },
        skip,
        take: limit,
        include: periodInclude,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: records,
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

  async findById(id: number): Promise<PeriodRow | null> {
    return this.prisma.periodos.findUnique({
      where: { periodoId: id },
      include: periodInclude,
    });
  }

  async findByName(nombre: string): Promise<PeriodRow | null> {
    return this.prisma.periodos.findUnique({
      where: { nombre: nombre.trim() },
      include: periodInclude,
    });
  }

  async findByNames(nombres: string[]): Promise<PeriodRow[]> {
    if (nombres.length === 0) return [];
    const trimmed = nombres.map((n) => n.trim());
    return this.prisma.periodos.findMany({
      where: { nombre: { in: trimmed } },
      include: periodInclude,
    });
  }

  async findOverlapping(
    fechaInicio: Date,
    fechaFin: Date,
    excludeId?: number,
  ): Promise<PeriodRow | null> {
    const where: Prisma.PeriodosWhereInput = {
      AND: [
        excludeId !== undefined ? { periodoId: { not: excludeId } } : {},
        { fechaInicio: { lte: fechaFin } },
        { fechaFin: { gte: fechaInicio } },
      ],
    };

    return this.prisma.periodos.findFirst({
      where,
      orderBy: { fechaInicio: 'asc' },
      include: periodInclude,
    });
  }

  async createBatch(data: CreatePeriodData[]): Promise<PeriodRow[]> {
    if (data.length === 0) return [];
    try {
      return await this.prisma.$transaction(async (tx) => {
        const results: PeriodRow[] = [];
        for (const item of data) {
          results.push(
            await tx.periodos.create({
              data: this.toCreateInput(item),
              include: periodInclude,
            }),
          );
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

  async update(id: number, data: UpdatePeriodData): Promise<PeriodRow> {
    try {
      return await this.prisma.periodos.update({
        where: { periodoId: id },
        data: this.toUpdateInput(data),
        include: periodInclude,
      });
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

  async delete(id: number): Promise<PeriodRow> {
    try {
      return await this.prisma.periodos.delete({
        where: { periodoId: id },
        include: periodInclude,
      });
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

  /**
   * Helpers privados — antes vivian en PeriodMapper.
   * Se mantienen como helpers privados del repo porque (a) son detalles
   * de adaptacion Prisma (trimestral parseo de fechas, defaults, etc.) y
   * (b) eliminan la ceremonia de un mapper 1:1 sin perder capacidad.
   */

  private toCreateInput(
    data: CreatePeriodData,
  ): Prisma.PeriodosUncheckedCreateInput {
    return {
      nombre: data.nombre.trim(),
      fechaInicio: this.parseDate(data.fechaInicio),
      fechaFin: this.parseDate(data.fechaFin),
      fechaVencimiento: this.parseDate(data.fechaVencimiento),
      estado: data.estado ?? EstadoPeriodo.ABIERTO,
    };
  }

  private toUpdateInput(
    data: UpdatePeriodData,
  ): Prisma.PeriodosUncheckedUpdateInput {
    const input: Prisma.PeriodosUncheckedUpdateInput = {};

    if (data.nombre !== undefined) {
      input.nombre = data.nombre.trim();
    }
    if (data.fechaInicio !== undefined) {
      input.fechaInicio = this.parseDate(data.fechaInicio);
    }
    if (data.fechaFin !== undefined) {
      input.fechaFin = this.parseDate(data.fechaFin);
    }
    if (data.fechaVencimiento !== undefined) {
      input.fechaVencimiento = this.parseDate(data.fechaVencimiento);
    }
    if (data.estado !== undefined) {
      input.estado = data.estado;
    }

    return input;
  }

  private toWhereInput(filters?: PeriodFilters): Prisma.PeriodosWhereInput {
    if (!filters) return {};
    const where: Prisma.PeriodosWhereInput = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    const searchTerm = (filters.search ?? filters.nombre ?? '').trim();
    if (searchTerm) {
      where.nombre = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }

    if (filters.fechaInicioDesde || filters.fechaInicioHasta) {
      const gte = filters.fechaInicioDesde
        ? this.parseDate(filters.fechaInicioDesde)
        : undefined;
      const lte = filters.fechaInicioHasta
        ? this.parseDate(filters.fechaInicioHasta)
        : undefined;

      where.fechaInicio = {
        ...(gte ? { gte } : {}),
        ...(lte ? { lte } : {}),
      };
    }

    return where;
  }

  private parseDate(value: Date | string): Date {
    return DateUtil.parseFrontendDate(value) ?? new Date(value);
  }
}
