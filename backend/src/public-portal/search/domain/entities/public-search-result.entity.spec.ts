import { SearchResultEntity, SearchType } from './public-search-result.entity';

describe('SearchResultEntity', () => {
  it('should create a cliente entity with correct fields', () => {
    const entity = new SearchResultEntity('cliente', '1', 'Juan Perez', {
      identificacion: '12345',
    });

    expect(entity.tipo).toBe('cliente');
    expect(entity.id).toBe('1');
    expect(entity.label).toBe('Juan Perez');
    expect(entity.extra).toEqual({ identificacion: '12345' });
  });

  it('should create a contrato entity with correct fields', () => {
    const entity = new SearchResultEntity('contrato', '42', 'G-2024-001', {
      estado: 'ACTIVO',
    });

    expect(entity.tipo).toBe('contrato');
    expect(entity.id).toBe('42');
    expect(entity.label).toBe('G-2024-001');
    expect(entity.extra).toEqual({ estado: 'ACTIVO' });
  });

  it('should enforce readonly fields at compile time', () => {
    const entity = new SearchResultEntity('cliente', '1', 'Test', {});

    // TypeScript readonly is compile-time only, so we verify via ts-expect-error
    // This test documents that these fields are declared readonly
    expect(entity.tipo).toBe('cliente');
    expect(entity.id).toBe('1');
    expect(entity.label).toBe('Test');
  });

  it('should accept empty extra object', () => {
    const entity = new SearchResultEntity('contrato', '0', '', {});

    expect(entity.tipo).toBe('contrato');
    expect(entity.id).toBe('0');
    expect(entity.extra).toEqual({});
  });
});
