export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Offset ya calculado para Prisma (`skip`/`take`).
 * Dueño canónico del shape que antes vivía duplicado como
 * `PaginationParams` en `infrastructure/common/utils/pagination.util.ts`.
 */
export interface PaginationOffset {
  skip: number;
  take: number;
  page: number;
}

/**
 * Entrada flexible aceptada por los repositorios `paginate()`.
 * Acepta `page`/`limit` (lo habitual) o `skip`/`take` ya calculados.
 */
export interface PaginateOptions {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

/**
 * Meta de paginación en respuestas.
 * Divergencia conocida con `PaginationMetaDto` (Swagger, solo español):
 * este tipo conserva `page`/`limit` además de `paginaActual`/`porPagina`
 * por compatibilidad con consumidores existentes. No renombrar sin
 * coordinar con UI/Swagger (breaking change).
 */
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

export interface PaginatedResult<T, K = unknown> {
  data: T[];
  meta: PaginationMeta;
  kpis?: K;
}
