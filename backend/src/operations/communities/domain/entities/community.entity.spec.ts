import { CommunityEntity } from './community.entity';

describe('CommunityEntity', () => {
  it('should create an entity with partial data', () => {
    const entity = new CommunityEntity({
      comunidadId: 1,
      nombre: 'Test Community',
      codigo: 'TC-001',
      porcentajeTasaSeguridad: 5.5,
    });

    expect(entity.comunidadId).toBe(1);
    expect(entity.nombre).toBe('Test Community');
    expect(entity.codigo).toBe('TC-001');
    expect(entity.porcentajeTasaSeguridad).toBe(5.5);
  });

  it('should set default values for properties not provided', () => {
    const entity = new CommunityEntity({
      comunidadId: 1,
      nombre: 'Minimal',
      codigo: 'MIN-001',
    });

    expect(entity.porcentajeTasaSeguridad).toBeUndefined();
    expect(entity.sectores).toBeUndefined();
    expect(entity.deletedAt).toBeUndefined();
  });

  it('should include sectores when provided', () => {
    const entity = new CommunityEntity({
      comunidadId: 1,
      nombre: 'With Sector',
      codigo: 'WS-001',
      sectores: [{ sectorId: 1, nombre: 'Sector A', codigo: 'SA-001' }],
    });

    expect(entity.sectores).toHaveLength(1);
    expect(entity.sectores![0].nombre).toBe('Sector A');
  });

  it('should handle null porcentajeTasaSeguridad', () => {
    const entity = new CommunityEntity({
      comunidadId: 1,
      nombre: 'Null Rate',
      codigo: 'NR-001',
      porcentajeTasaSeguridad: null,
    });

    expect(entity.porcentajeTasaSeguridad).toBeNull();
  });
});
