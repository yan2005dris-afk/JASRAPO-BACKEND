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

export interface CreateOrdenTrabajoData {
  rutaId: bigint;
  contratoId: bigint;
  medidorId?: bigint | null;
  estado?: string;
  ordenVisita?: number;
}

export interface UpdateOperatorWorkOrderData {
  estado?: string;
  resultadoObservacion?: string | null;
  evidenciaFotoUrl?: string | null;
  completadoEn?: Date | null;
}

export interface FindOrdenesByRutaParams {
  filters: OrdenTrabajoFilters;
  pagination: PaginateOptions;
}

/**
 * Resumen agregado de órdenes de trabajo para una ruta.
 * Refleja los conteos por estado sobre el set completo filtrado
 * (no solo la página actual).
 */
export interface OrdenTrabajoKpis {
  total: number;
  completadas: number;
  pendientes: number;
  conNovedad: number;
  canceladas: number;
}

/**
 * Resumen agregado de lecturas vinculadas a una ruta.
 * Los nombres de los campos reflejan el enum `EstadoLectura` (no
 * `EstadoOrdenTrabajo`) porque los kpis se computan sobre la lectura
 * misma, no sobre la orden que la disparó.
 */
export interface LecturaKpis {
  total: number;
  aprobadas: number;
  pendientes: number;
  conNovedad: number;
  rechazadas: number;
}
