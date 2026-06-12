import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { SectorEntity, ComunidadRef } from '../../domain/entities/sector.entity';
import { CreateSectorData } from '../../domain/types/create-sector-data';
import { UpdateSectorData } from '../../domain/types/update-sector-data';
import { SectorFilters } from '../../domain/types/sector-filters';
import { SectorMapper } from '../mappers/sector.mapper';

@Injectable()
export class PrismaSectorRepository implements SectorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: {
    sectorId: number;
  }): Promise<SectorEntity | null> {
    const raw = await this.prisma.sectores.findUnique({
      where,
      include: { comunidades: true },
    });
    return raw ? SectorMapper.toDomain(raw) : null;
  }

  async findMany(params?: {
    where?: SectorFilters;
    orderBy?: { sectorId?: 'asc' | 'desc' };
    skip?: number;
    take?: number;
  }): Promise<SectorEntity[]> {
    const raws = await this.prisma.sectores.findMany({
      where: params?.where as any,
      orderBy: params?.orderBy,
      skip: params?.skip,
      take: params?.take,
      include: { comunidades: true },
    });
    return SectorMapper.toDomainList(raws);
  }

  async count(params: { where?: SectorFilters }): Promise<number> {
    return this.prisma.sectores.count({
      where: params?.where as any,
    });
  }

  async create(data: CreateSectorData): Promise<SectorEntity> {
    const raw = await this.prisma.sectores.create({
      data,
      include: { comunidades: true },
    });
    return SectorMapper.toDomain(raw);
  }

  async update(
    where: { sectorId: number },
    data: UpdateSectorData,
  ): Promise<SectorEntity> {
    const raw = await this.prisma.sectores.update({
      where,
      data,
      include: { comunidades: true },
    });
    return SectorMapper.toDomain(raw);
  }

  async delete(where: { sectorId: number }): Promise<SectorEntity> {
    const raw = await this.prisma.sectores.update({
      where,
      data: { deletedAt: new Date() },
      include: { comunidades: true },
    });
    return SectorMapper.toDomain(raw);
  }

  async findComunidad(where: {
    comunidadId: number;
  }): Promise<ComunidadRef | null> {
    const comunidad = await this.prisma.comunidades.findUnique({
      where,
    });
    if (!comunidad) return null;
    return {
      comunidadId: comunidad.comunidadId,
      codigo: comunidad.codigo,
      nombre: comunidad.nombre,
    };
  }
}
