import { SectorFilters } from './sector-filters';

describe('SectorFilters', () => {
  it('should accept empty filters', () => {
    const filters: SectorFilters = {};

    expect(filters).toEqual({});
  });

  it('should accept partial filters', () => {
    const filters: SectorFilters = { nombre: 'Sector' };

    expect(filters.nombre).toBe('Sector');
  });

  it('should accept all filter fields', () => {
    const filters: SectorFilters = {
      nombre: 'Sector A',
      codigo: 'SA-001',
      deletedAt: null,
    };

    expect(filters.nombre).toBe('Sector A');
    expect(filters.codigo).toBe('SA-001');
    expect(filters.deletedAt).toBeNull();
  });
});
