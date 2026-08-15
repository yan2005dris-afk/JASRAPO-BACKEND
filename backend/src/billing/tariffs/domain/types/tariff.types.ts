export interface TariffCategoryFilters {
  nombre?: string;
  activo?: boolean;
}

export interface CreateTariffCategoryData {
  nombre: string;
  descripcion?: string | null;
  valorBase?: number;
  consumoMinimoMensual?: number | null;
  valorExcedenteM3?: number;
  fechaVigenciaDesde?: Date | null;
  fechaVigenciaHasta?: Date | null;
  activo?: boolean;
}

export interface UpdateTariffCategoryData {
  nombre?: string;
  descripcion?: string | null;
  valorBase?: number;
  consumoMinimoMensual?: number | null;
  valorExcedenteM3?: number;
}
