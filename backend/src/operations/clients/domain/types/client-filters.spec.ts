import { buildClientFilters } from './client-filters';

describe('buildClientFilters', () => {
  it('should return empty object when no filters provided', () => {
    const result = buildClientFilters({});
    expect(result).toEqual({});
  });

  it('should return empty object when all fields are undefined', () => {
    const result = buildClientFilters({
      identificacion: undefined,
      nombres: undefined,
      apellidos: undefined,
      nombreCompleto: undefined,
      activo: undefined,
    });
    expect(result).toEqual({});
  });

  it('should include identificacion filter', () => {
    const result = buildClientFilters({ identificacion: '123' });
    expect(result.identificacion).toBe('123');
  });

  it('should include nombres filter', () => {
    const result = buildClientFilters({ nombres: 'Juan' });
    expect(result.nombres).toBe('Juan');
  });

  it('should include apellidos filter', () => {
    const result = buildClientFilters({ apellidos: 'Perez' });
    expect(result.apellidos).toBe('Perez');
  });

  it('should include nombreCompleto filter', () => {
    const result = buildClientFilters({ nombreCompleto: 'Juan Perez' });
    expect(result.nombreCompleto).toBe('Juan Perez');
  });

  it('should include activo filter when true', () => {
    const result = buildClientFilters({ activo: true });
    expect(result.activo).toBe(true);
  });

  it('should include activo filter when false', () => {
    const result = buildClientFilters({ activo: false });
    expect(result.activo).toBe(false);
  });

  it('should include multiple filters simultaneously', () => {
    const result = buildClientFilters({
      identificacion: '123',
      nombres: 'Juan',
      activo: true,
    });
    expect(result).toEqual({
      identificacion: '123',
      nombres: 'Juan',
      activo: true,
    });
  });

  it('should ignore page and limit fields from pagination', () => {
    const result = buildClientFilters({
      identificacion: '123',
      page: 2,
      limit: 20,
    });
    expect(result.identificacion).toBe('123');
    expect((result as any).page).toBeUndefined();
    expect((result as any).limit).toBeUndefined();
  });
});
