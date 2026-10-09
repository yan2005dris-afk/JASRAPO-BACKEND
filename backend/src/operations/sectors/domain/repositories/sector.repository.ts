import type { SectorRow } from '../types/sector.types';
import type {
  CreateSectorData,
  UpdateSectorData,
  SectorFilters,
  ComunidadRef,
} from '../types/sector.types';

export abstract class SectorRepository {
  abstract findById(
    id: number,
    includeDeleted?: boolean,
  ): Promise<SectorRow | null>;
  abstract findByCodigo(codigo: string): Promise<SectorRow | null>;
  abstract findComunidadById(comunidadId: number): Promise<ComunidadRef | null>;
  abstract paginate(
    filters: SectorFilters,
    pagination: { skip: number; take: number },
  ): Promise<{ data: SectorRow[]; total: number }>;
  abstract create(data: CreateSectorData): Promise<SectorRow>;
  abstract update(id: number, data: UpdateSectorData): Promise<SectorRow>;
  abstract softDelete(id: number): Promise<SectorRow>;
}
