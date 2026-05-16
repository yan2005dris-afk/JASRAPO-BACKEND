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
