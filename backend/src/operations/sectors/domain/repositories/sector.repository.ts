import type { SectorEntity, ComunidadRef } from '../entities/sector.entity';
import type { CreateSectorData } from '../types/create-sector-data';
import type { UpdateSectorData } from '../types/update-sector-data';
import type { SectorFilters } from '../types/sector-filters';

export abstract class SectorRepository {
  abstract findById(
    id: number,
    includeDeleted?: boolean,
  ): Promise<SectorEntity | null>;

  abstract findByCodigo(codigo: string): Promise<SectorEntity | null>;

  abstract findComunidadById(comunidadId: number): Promise<ComunidadRef | null>;

  abstract paginate(
    filters: SectorFilters,
    pagination: { skip: number; take: number },
  ): Promise<{ data: SectorEntity[]; total: number }>;

  abstract create(data: CreateSectorData): Promise<SectorEntity>;

  abstract update(
    id: number,
    data: UpdateSectorData,
  ): Promise<SectorEntity>;

  abstract softDelete(id: number): Promise<SectorEntity>;
}
