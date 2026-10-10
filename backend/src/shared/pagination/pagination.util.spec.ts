import { getPagination, paginate } from './pagination.util';

describe('getPagination', () => {
  it('should return default pagination when called without args', () => {
    expect(getPagination()).toEqual({ skip: 0, take: 10, page: 1 });
  });

  it('should compute skip from page and limit', () => {
    expect(getPagination(3, 10)).toEqual({ skip: 20, take: 10, page: 3 });
  });

  it('should clamp a negative page to 1', () => {
    expect(getPagination(-1, 10)).toEqual({ skip: 0, take: 10, page: 1 });
  });

  it('should clamp a zero page to 1', () => {
    expect(getPagination(0, 10)).toEqual({ skip: 0, take: 10, page: 1 });
  });

  it('should floor a fractional page before computing skip', () => {
    expect(getPagination(2.9, 10)).toEqual({ skip: 10, take: 10, page: 2 });
  });

  it('should clamp a limit above 50 to 50', () => {
    expect(getPagination(1, 100)).toEqual({ skip: 0, take: 50, page: 1 });
  });

  it('should clamp a zero limit to 1', () => {
    expect(getPagination(1, 0)).toEqual({ skip: 0, take: 1, page: 1 });
  });

  it('should clamp a negative limit to 1', () => {
    expect(getPagination(1, -5)).toEqual({ skip: 0, take: 1, page: 1 });
  });

  it('should floor a fractional limit', () => {
    expect(getPagination(1, 12.9)).toEqual({ skip: 0, take: 12, page: 1 });
  });

  it('should fall back to defaults for NaN page and limit', () => {
    expect(getPagination(NaN, NaN)).toEqual({ skip: 0, take: 10, page: 1 });
  });
});

describe('paginate', () => {
  const model = {
    count: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated result with meta', async () => {
    model.count.mockResolvedValue(25);
    model.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await paginate(model, { where: {} }, { page: 2, limit: 10 });

    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.meta).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      ultimaPagina: 3,
      paginaActual: 2,
      porPagina: 10,
      anterior: 1,
      siguiente: 3,
    });
    expect(model.count).toHaveBeenCalledWith({ where: {} });
    expect(model.findMany).toHaveBeenCalledWith({
      where: {},
      take: 10,
      skip: 10,
    });
  });

  it('should not provide a next page on the last page', async () => {
    model.count.mockResolvedValue(20);
    model.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await paginate(model, { where: {} }, { page: 2, limit: 10 });

    expect(result.meta.siguiente).toBeNull();
    expect(result.meta.anterior).toBe(1);
  });

  it('should clamp invalid limit to 1', async () => {
    model.count.mockResolvedValue(3);
    model.findMany.mockResolvedValue([]);

    const result = await paginate(model, { where: {} }, { page: 1, limit: 0 });

    expect(model.findMany).toHaveBeenCalledWith({
      where: {},
      take: 1,
      skip: 0,
    });
    expect(result.meta.limit).toBe(1);
  });

  it('should cap limit at 50', async () => {
    model.count.mockResolvedValue(60);
    model.findMany.mockResolvedValue([]);

    await paginate(model, { where: {} }, { page: 1, limit: 100 });

    expect(model.findMany).toHaveBeenCalledWith({
      where: {},
      take: 50,
      skip: 0,
    });
  });
});
