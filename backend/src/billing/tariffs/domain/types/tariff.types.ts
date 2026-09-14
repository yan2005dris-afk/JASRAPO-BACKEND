export interface TariffCategoryFilters {
  nombre?: string;
  /** Texto libre del buscador del listado: coincide con nombre o descripción. */
  search?: string;
  activo?: boolean;
}

export interface CreateTariffCategoryData {
  nombre: string;
  descripcion?: string | null;
  consumoMinimoMensual?: number | null;
  fechaVigenciaDesde?: Date | null;
  fechaVigenciaHasta?: Date | null;
  activo?: boolean;
}

export interface UpdateTariffCategoryData {
  nombre?: string;
  descripcion?: string | null;
  consumoMinimoMensual?: number | null;
  fechaVigenciaDesde?: Date | null;
  fechaVigenciaHasta?: Date | null;
  activo?: boolean;
}
