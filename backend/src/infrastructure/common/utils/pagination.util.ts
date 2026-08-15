import type { PaginatedResult } from '../types/paginated-result.type';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
}

function toFiniteNumberOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function getPagination(page = 1, limit = 10): PaginationParams {
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

export interface PaginateOptions {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

export async function paginate<K>(
  model: any,
  args: any = { where: {} },
  options: PaginateOptions = { page: 1, limit: 10 },
): Promise<PaginatedResult<K>> {
  const page = Math.max(1, Math.floor(toFiniteNumberOr(options.page, 1)));
  const perPage = Math.min(
    50,
    Math.max(1, Math.floor(toFiniteNumberOr(options.limit, 10))),
  );

  const skip = (page - 1) * perPage;
  const [total, data] = await Promise.all([
    model.count({ where: args.where }),
    model.findMany({
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
