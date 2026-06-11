export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    ultimaPagina: number;
    paginaActual: number;
    porPagina: number;
    anterior: number | null;
    siguiente: number | null;
  };
}
