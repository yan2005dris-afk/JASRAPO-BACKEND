import type { SectorEntity, ComunidadRef } from '../entities/sector.entity';
import type { CreateSectorData } from '../types/create-sector-data';
import type { UpdateSectorData } from '../types/update-sector-data';
import type { SectorFilters } from '../types/sector-filters';

export abstract class SectorRepository {
  abstract findUnique(where: {
    sectorId: number;
  }): Promise<SectorEntity | null>;

  abstract findMany(params?: {
    where?: SectorFilters;
    orderBy?: { sectorId?: 'asc' | 'desc' };
    skip?: number;
    take?: number;
  }): Promise<SectorEntity[]>;

  abstract count(params: { where?: SectorFilters }): Promise<number>;

  abstract create(data: CreateSectorData): Promise<SectorEntity>;

  abstract update(
    where: { sectorId: number },
    data: UpdateSectorData,
  ): Promise<SectorEntity>;

  abstract delete(where: { sectorId: number }): Promise<SectorEntity>;

  abstract findComunidad(where: {
    comunidadId: number;
  }): Promise<ComunidadRef | null>;
}
