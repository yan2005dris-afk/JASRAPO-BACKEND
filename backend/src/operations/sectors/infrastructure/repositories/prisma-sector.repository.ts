import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import {
  SectorEntity,
  ComunidadRef,
} from '../../domain/entities/sector.entity';
import type { CreateSectorData } from '../../domain/types/create-sector-data';
import type { UpdateSectorData } from '../../domain/types/update-sector-data';
import type { SectorFilters } from '../../domain/types/sector-filters';
import { SectorMapper } from '../mappers/sector.mapper';
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
  ): Promise<SectorEntity | null> {
    const raw = await this.prisma.sectores.findFirst({
      where: {
        sectorId: id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: { comunidades: true },
    });
    return raw ? SectorMapper.toDomain(raw) : null;
  }

  async findByCodigo(codigo: string): Promise<SectorEntity | null> {
    const raw = await this.prisma.sectores.findUnique({
      where: { codigo },
      include: { comunidades: true },
    });
    return raw ? SectorMapper.toDomain(raw) : null;
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
  ): Promise<{ data: SectorEntity[]; total: number }> {
    const where: Prisma.SectoresWhereInput = {
      deletedAt: null,
      ...(filters.comunidadId !== undefined
        ? { comunidadId: filters.comunidadId }
        : {}),
    };

    const [raws, total] = await Promise.all([
      this.prisma.sectores.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { sectorId: 'asc' },
        include: { comunidades: true },
      }),
      this.prisma.sectores.count({ where }),
    ]);

    return {
      data: SectorMapper.toDomainList(raws),
      total,
    };
  }

  async create(data: CreateSectorData): Promise<SectorEntity> {
    try {
      const raw = await this.prisma.sectores.create({
        data,
        include: { comunidades: true },
      });
      return SectorMapper.toDomain(raw);
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

  async update(id: number, data: UpdateSectorData): Promise<SectorEntity> {
    try {
      const raw = await this.prisma.sectores.update({
        where: { sectorId: id },
        data,
        include: { comunidades: true },
      });
      return SectorMapper.toDomain(raw);
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
        throw new EntityAlreadyExistsException('Sector', data.codigo ?? id);
      }
      throw error;
    }
  }

  async softDelete(id: number): Promise<SectorEntity> {
    try {
      const raw = await this.prisma.sectores.update({
        where: { sectorId: id },
        data: { deletedAt: new Date() },
        include: { comunidades: true },
      });
      return SectorMapper.toDomain(raw);
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
