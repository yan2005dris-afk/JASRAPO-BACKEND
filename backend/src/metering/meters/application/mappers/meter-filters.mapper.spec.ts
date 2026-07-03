import { buildMeterFilters } from './meter-filters.mapper';

describe('buildMeterFilters', () => {
  it('should return empty object when no filters provided', () => {
    const result = buildMeterFilters({});
    expect(result).toEqual({});
  });

  it('should return empty object when all fields are undefined', () => {
    const result = buildMeterFilters({
      estado: undefined,
      marca: undefined,
      modelo: undefined,
      serie: undefined,
      search: undefined,
    });
    expect(result).toEqual({});
  });

  it('should include estado filter', () => {
    const result = buildMeterFilters({ estado: 'BODEGA' });
    expect(result.estado).toBe('BODEGA');
  });

  it('should include marca filter', () => {
    const result = buildMeterFilters({ marca: 'Itron' });
    expect(result.marca).toBe('Itron');
  });

  it('should include modelo filter', () => {
    const result = buildMeterFilters({ modelo: 'DIGITAL' });
    expect(result.modelo).toBe('DIGITAL');
  });

  it('should include serie filter', () => {
    const result = buildMeterFilters({ serie: 'MED-001' });
    expect(result.serie).toBe('MED-001');
  });

  it('should include search filter', () => {
    const result = buildMeterFilters({ search: '123' });
    expect(result.search).toBe('123');
  });

  it('should ignore page and limit fields from pagination', () => {
    const result = buildMeterFilters({
      estado: 'BODEGA',
      page: 2,
      limit: 20,
    });
    expect(result.estado).toBe('BODEGA');
    expect((result as any).page).toBeUndefined();
    expect((result as any).limit).toBeUndefined();
  });
});
