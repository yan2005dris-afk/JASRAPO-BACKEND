export interface SectorFilters {
  codigo?: string;
  nombre?: string;
  comunidadId?: number;
  search?: string;
}

export interface CreateSectorData {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  comunidadId: number;
}

export interface UpdateSectorData {
  nombre?: string;
  descripcion?: string | null;
  comunidadId?: number;
}
