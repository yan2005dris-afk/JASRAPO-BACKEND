import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import type {
  CreateTariffCategoryData,
  UpdateTariffCategoryData,
  TariffCategoryFilters,
} from '../../domain/types/tariff.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';
import {
  paginate,
  type PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import {
  TariffCategoryMapper,
  type TariffCategoryPrismaRaw,
} from '../mappers/tariff-category.mapper';

export const safeTariffCategoriesSelect = {
  categoriaTarifaId: true,
  nombre: true,
  descripcion: true,
  valorBase: true,
  consumoMinimoMensual: true,
  valorExcedenteM3: true,
  fechaVigenciaDesde: true,
  fechaVigenciaHasta: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.CategoriaTarifaSelect;

@Injectable()
export class PrismaTariffRepository implements TariffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: number,
    includeDeleted = false,
  ): Promise<TariffCategoryEntity | null> {
    const raw = await this.prisma.categoriaTarifa.findFirst({
      where: {
        categoriaTarifaId: id,
        ...(includeDeleted ? {} : { deletedAt: null, activo: true }),
      },
      select: safeTariffCategoriesSelect,
    });
    return TariffCategoryMapper.toDomain(raw);
  }

  async findActiveByNombre(
    nombre: string,
  ): Promise<TariffCategoryEntity | null> {
    const raw = await this.prisma.categoriaTarifa.findFirst({
      where: {
        nombre: { equals: nombre, mode: 'insensitive' },
        activo: true,
        deletedAt: null,
      },
      select: safeTariffCategoriesSelect,
    });
    return TariffCategoryMapper.toDomain(raw);
  }

  async paginate(
    filters: TariffCategoryFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<TariffCategoryEntity>> {
    const where: Prisma.CategoriaTarifaWhereInput = {
      deletedAt: null,
      ...(filters.activo !== undefined ? { activo: filters.activo } : { activo: true }),
      ...(filters.nombre
        ? { nombre: { contains: filters.nombre, mode: 'insensitive' } }
        : {}),
    };

    const paginated = await paginate<TariffCategoryPrismaRaw>(
      this.prisma.categoriaTarifa,
      {
        where,
        orderBy: { createdAt: 'desc' },
        select: safeTariffCategoriesSelect,
      },
      pagination,
    );

    return {
      data: TariffCategoryMapper.toDomainList(paginated.data),
      meta: paginated.meta,
    };
  }

  async create(data: CreateTariffCategoryData): Promise<TariffCategoryEntity> {
    try {
      const now = new Date();
      const raw = await this.prisma.categoriaTarifa.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          valorBase: new Prisma.Decimal(data.valorBase ?? 0),
          consumoMinimoMensual: data.consumoMinimoMensual,
          valorExcedenteM3: new Prisma.Decimal(data.valorExcedenteM3 ?? 0),
          fechaVigenciaDesde: data.fechaVigenciaDesde ?? now,
          fechaVigenciaHasta: data.fechaVigenciaHasta ?? null,
          activo: data.activo ?? true,
          createdAt: now,
        },
        select: safeTariffCategoriesSelect,
      });
      return TariffCategoryMapper.toDomain(raw)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('CategoriaTarifa', data.nombre);
      }
      throw error;
    }
  }

  async createNewVersion(
    currentId: number,
    data: UpdateTariffCategoryData,
  ): Promise<TariffCategoryEntity> {
    try {
      const now = new Date();
      const result = await this.prisma.$transaction(async (tx) => {
        const current = await tx.categoriaTarifa.findFirst({
          where: {
            categoriaTarifaId: currentId,
            activo: true,
            deletedAt: null,
          },
        });

        if (!current) {
          throw new EntityNotFoundException('CategoriaTarifa', currentId);
        }

        // Validate unique name if changed
        if (data.nombre && data.nombre.toLowerCase() !== current.nombre.toLowerCase()) {
          const existing = await tx.categoriaTarifa.findFirst({
            where: {
              nombre: { equals: data.nombre, mode: 'insensitive' },
              activo: true,
              deletedAt: null,
            },
          });

          if (existing) {
            throw new EntityAlreadyExistsException(
              'CategoriaTarifa',
              data.nombre,
            );
          }
        }

        // Close current version
        await tx.categoriaTarifa.update({
          where: { categoriaTarifaId: currentId },
          data: {
            fechaVigenciaHasta: now,
            activo: false,
            updatedAt: now,
          },
        });

        // Create new active version
        const newRecord = await tx.categoriaTarifa.create({
          data: {
            nombre: data.nombre ?? current.nombre,
            descripcion: data.descripcion !== undefined ? data.descripcion : current.descripcion,
            valorBase:
              data.valorBase !== undefined
                ? new Prisma.Decimal(data.valorBase)
                : current.valorBase,
            consumoMinimoMensual:
              data.consumoMinimoMensual !== undefined
                ? data.consumoMinimoMensual
                : current.consumoMinimoMensual,
            valorExcedenteM3:
              data.valorExcedenteM3 !== undefined
                ? new Prisma.Decimal(data.valorExcedenteM3)
                : current.valorExcedenteM3,
            fechaVigenciaDesde: now,
            fechaVigenciaHasta: null,
            activo: true,
            createdAt: now,
          },
          select: safeTariffCategoriesSelect,
        });

        return newRecord;
      });

      return TariffCategoryMapper.toDomain(result)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('CategoriaTarifa', currentId);
      }
      throw error;
    }
  }

  async softDelete(id: number): Promise<TariffCategoryEntity> {
    try {
      const now = new Date();
      const raw = await this.prisma.categoriaTarifa.update({
        where: { categoriaTarifaId: id },
        data: {
          activo: false,
          fechaVigenciaHasta: now,
          deletedAt: now,
          updatedAt: now,
        },
        select: safeTariffCategoriesSelect,
      });
      return TariffCategoryMapper.toDomain(raw)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('CategoriaTarifa', id);
      }
      throw error;
    }
  }
}
