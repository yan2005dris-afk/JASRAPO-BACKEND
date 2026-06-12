import type { CommunityFilters } from './community-filters';

describe('CommunityFilters', () => {
  it('should accept optional filter fields', () => {
    const filters: CommunityFilters = {
      nombre: 'test',
      codigo: 'TC-001',
    };

    expect(filters.nombre).toBe('test');
    expect(filters.codigo).toBe('TC-001');
  });
});
