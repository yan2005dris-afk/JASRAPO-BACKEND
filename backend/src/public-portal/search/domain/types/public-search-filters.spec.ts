import type {
  ISearchFilters,
  ISearchPaginationMeta,
} from './public-search-filters';

describe('ISearchFilters', () => {
  it('should accept a complete search filter object', () => {
    const filters: ISearchFilters = {
      valor: 'juan perez',
      isIdent: false,
    };

    expect(filters.valor).toBe('juan perez');
    expect(filters.isIdent).toBe(false);
  });

  it('should accept search filter with isIdent true', () => {
    const filters: ISearchFilters = {
      valor: '12345678',
      isIdent: true,
    };

    expect(filters.valor).toBe('12345678');
    expect(filters.isIdent).toBe(true);
  });
});

describe('ISearchPaginationMeta', () => {
  it('should create a pagination meta object', () => {
    const meta: ISearchPaginationMeta = {
      total: 100,
      page: 1,
      limit: 10,
    };

    expect(meta.total).toBe(100);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(10);
  });
});
