export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  ultimaPagina: number;
  paginaActual: number;
  porPagina: number;
  anterior: number | null;
  siguiente: number | null;
}

export interface PaginatedResult<T, K = Record<string, any>> {
  data: T[];
  meta: PaginationMeta;
  kpis?: K;
}
