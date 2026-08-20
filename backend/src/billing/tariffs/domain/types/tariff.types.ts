export interface TariffCategoryFilters {
  nombre?: string;
  activo?: boolean;
}

export interface CreateTariffCategoryData {
  nombre: string;
  descripcion?: string | null;
  fechaVigenciaDesde?: Date | null;
  fechaVigenciaHasta?: Date | null;
  activo?: boolean;
}

export interface UpdateTariffCategoryData {
  nombre?: string;
  descripcion?: string | null;
  fechaVigenciaDesde?: Date | null;
  fechaVigenciaHasta?: Date | null;
  activo?: boolean;
}
