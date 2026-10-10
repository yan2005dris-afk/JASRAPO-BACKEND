import type {
  PaginatedResult,
  PaginateOptions,
  PaginationOffset,
} from 'src/shared/pagination/pagination.types';

/**
 * @deprecated Importar `PaginationOffset` desde
 * `src/shared/pagination/pagination.types`. Se mantiene como alias
 * para no romper imports existentes.
 */
export type PaginationParams = PaginationOffset;
export type { PaginateOptions };

function toFiniteNumberOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function getPagination(page = 1, limit = 10): PaginationOffset {
  const safePage = Math.max(1, Math.floor(toFiniteNumberOr(page, 1)));
  const safeLimit = Math.min(
    50,
    Math.max(1, Math.floor(toFiniteNumberOr(limit, 10))),
  );
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
  };
}

export interface PaginableModel<K> {
  count(args?: { where?: unknown }): Promise<number>;
  findMany(args?: Record<string, unknown>): Promise<K[]>;
}

type InternalPaginableModel<K> = {
  count: (args: { where?: unknown }) => Promise<number>;
  findMany: (args: Record<string, unknown>) => Promise<K[]>;
};

export async function paginate<K>(
  model: unknown,
  args: { where?: unknown } & Record<string, unknown> = { where: {} },
  options: PaginateOptions = { page: 1, limit: 10 },
): Promise<PaginatedResult<K>> {
  const page = Math.max(1, Math.floor(toFiniteNumberOr(options.page, 1)));
  const perPage = Math.min(
    50,
    Math.max(1, Math.floor(toFiniteNumberOr(options.limit, 10))),
  );

  const skip = (page - 1) * perPage;
  // Prisma delegates aceptan `{ where, ... }`; se castea desde `unknown`
  // para no exponer `any` en la firma pública.
  const countable = model as InternalPaginableModel<K>;
  const [total, data] = await Promise.all([
    countable.count({ where: args.where }),
    countable.findMany({
      ...args,
      take: perPage,
      skip,
    }),
  ]);

  const lastPage = Math.ceil(total / perPage);

  return {
    data,
    meta: {
      total,
      page,
      limit: perPage,
      ultimaPagina: lastPage,
      paginaActual: page,
      porPagina: perPage,
      anterior: page > 1 ? page - 1 : null,
      siguiente: page < lastPage ? page + 1 : null,
    },
  };
}
