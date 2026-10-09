import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { sectorInclude, type SectorRow } from './sector.include';
import type {
  CreateSectorData,
  UpdateSectorData,
  SectorFilters,
  ComunidadRef,
} from '../../domain/types/sector.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaSectorRepository implements SectorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: number,
    includeDeleted: boolean = false,
  ): Promise<SectorRow | null> {
    return this.prisma.sectores.findFirst({
      where: {
        sectorId: id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: sectorInclude,
    });
  }

  async findByCodigo(codigo: string): Promise<SectorRow | null> {
    return this.prisma.sectores.findUnique({
      where: { codigo },
      include: sectorInclude,
    });
  }

  async findComunidadById(comunidadId: number): Promise<ComunidadRef | null> {
    const comunidad = await this.prisma.comunidades.findUnique({
      where: { comunidadId },
    });
    if (!comunidad) return null;
    return {
      comunidadId: comunidad.comunidadId,
      codigo: comunidad.codigo,
      nombre: comunidad.nombre,
    };
  }

  async paginate(
    filters: SectorFilters,
    pagination: { skip: number; take: number },
  ): Promise<{ data: SectorRow[]; total: number }> {
    const where: Prisma.SectoresWhereInput = {
      deletedAt: null,
      ...(filters.comunidadId !== undefined
        ? { comunidadId: filters.comunidadId }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.sectores.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { sectorId: 'asc' },
        include: sectorInclude,
      }),
      this.prisma.sectores.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: CreateSectorData): Promise<SectorRow> {
    try {
      return await this.prisma.sectores.create({
        data,
        include: sectorInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('Sector', data.codigo);
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateSectorData): Promise<SectorRow> {
    try {
      return await this.prisma.sectores.update({
        where: { sectorId: id },
        data,
        include: sectorInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Sector', id);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('Sector', id.toString());
      }
      throw error;
    }
  }

  async softDelete(id: number): Promise<SectorRow> {
    try {
      return await this.prisma.sectores.update({
        where: { sectorId: id },
        data: { deletedAt: new Date() },
        include: sectorInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Sector', id);
      }
      throw error;
    }
  }
}
