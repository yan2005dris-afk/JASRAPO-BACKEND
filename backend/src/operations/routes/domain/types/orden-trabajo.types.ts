import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

export interface OrdenTrabajoFilters {
  rutaId?: bigint;
  estado?: string;
}

export interface UpdateOrdenEstadoData {
  estado: string;
  resultadoObservacion?: string;
}

export interface LinkLecturaData {
  lecturaId: bigint;
}

export interface FindOrdenesByRutaParams {
  filters: OrdenTrabajoFilters;
  pagination: PaginateOptions;
}
