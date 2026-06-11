import type { PaginatedResult } from '../types/paginated-result.type';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
}

export function getPagination(page = 1, limit = 10): PaginationParams {
  const safeLimit = Math.min(limit, 50);
  const safePage = page < 1 ? 1 : page;
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
  };
}

export interface PaginateOptions {
  page?: number;
  limit?: number;
}

export async function paginate<K>(
  model: any,
  args: any = { where: {} },
  options: PaginateOptions = { page: 1, limit: 10 },
): Promise<PaginatedResult<K>> {
  const page = Number(options.page) > 0 ? Number(options.page) : 1;
  const perPage = Number(options.limit) > 0 ? Number(options.limit) : 10;

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
