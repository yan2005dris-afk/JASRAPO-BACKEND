import type { Periodos, Prisma } from 'src/generated/prisma/client';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import { PeriodEntity } from '../../domain/entities/period.entity';
import type {
  CreatePeriodData,
  UpdatePeriodData,
  PeriodFilters,
} from '../../domain/types/period.types';
import { DateUtil } from 'src/shared/utils/date.util';

export class PeriodMapper {
  static toDomain(raw: Periodos | null | undefined): PeriodEntity | null {
    if (!raw) return null;
    return new PeriodEntity({
      periodoId: raw.periodoId,
      nombre: raw.nombre,
      fechaInicio: raw.fechaInicio,
      fechaFin: raw.fechaFin,
      fechaVencimiento: raw.fechaVencimiento,
      estado: raw.estado,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDomainList(rawList: Periodos[]): PeriodEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((e): e is PeriodEntity => e !== null);
  }

  static toPrismaCreateInput(
    data: CreatePeriodData,
  ): Prisma.PeriodosUncheckedCreateInput {
    const fechaInicio =
      DateUtil.parseFrontendDate(data.fechaInicio) ??
      new Date(data.fechaInicio);
    const fechaFin =
      DateUtil.parseFrontendDate(data.fechaFin) ?? new Date(data.fechaFin);
    const fechaVencimiento =
      DateUtil.parseFrontendDate(data.fechaVencimiento) ??
      new Date(data.fechaVencimiento);

    return {
      nombre: data.nombre.trim(),
      fechaInicio,
      fechaFin,
      fechaVencimiento,
      estado: data.estado ?? EstadoPeriodo.ABIERTO,
    };
  }

  static toPrismaUpdateInput(
    data: UpdatePeriodData,
  ): Prisma.PeriodosUncheckedUpdateInput {
    const input: Prisma.PeriodosUncheckedUpdateInput = {};

    if (data.nombre !== undefined) {
      input.nombre = data.nombre.trim();
    }
    if (data.fechaInicio !== undefined) {
      input.fechaInicio =
        DateUtil.parseFrontendDate(data.fechaInicio) ??
        new Date(data.fechaInicio);
    }
    if (data.fechaFin !== undefined) {
      input.fechaFin =
        DateUtil.parseFrontendDate(data.fechaFin) ?? new Date(data.fechaFin);
    }
    if (data.fechaVencimiento !== undefined) {
      input.fechaVencimiento =
        DateUtil.parseFrontendDate(data.fechaVencimiento) ??
        new Date(data.fechaVencimiento);
    }
    if (data.estado !== undefined) {
      input.estado = data.estado;
    }

    return input;
  }

  static toPrismaWhereInput(
    filters?: PeriodFilters,
  ): Prisma.PeriodosWhereInput {
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
        ? (DateUtil.parseFrontendDate(filters.fechaInicioDesde) ??
          new Date(filters.fechaInicioDesde))
        : undefined;
      const lte = filters.fechaInicioHasta
        ? (DateUtil.parseFrontendDate(filters.fechaInicioHasta) ??
          new Date(filters.fechaInicioHasta))
        : undefined;

      where.fechaInicio = {
        ...(gte ? { gte } : {}),
        ...(lte ? { lte } : {}),
      };
    }

    return where;
  }
}
