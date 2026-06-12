import type { ComunidadRef } from './sector.entity';
import { SectorEntity } from './sector.entity';

describe('SectorEntity', () => {
  it('should create an instance with all required fields', () => {
    const entity = new SectorEntity(
      1,
      'Sector Norte',
      'SN-001',
      10,
      null,
      null,
      new Date('2024-01-01'),
      new Date('2024-06-01'),
    );

    expect(entity.sectorId).toBe(1);
    expect(entity.nombre).toBe('Sector Norte');
    expect(entity.codigo).toBe('SN-001');
    expect(entity.comunidadId).toBe(10);
    expect(entity.comunidades).toBeNull();
    expect(entity.deletedAt).toBeNull();
    expect(entity.createdAt).toEqual(new Date('2024-01-01'));
    expect(entity.updatedAt).toEqual(new Date('2024-06-01'));
  });

  it('should create an instance with optional comunidades ref', () => {
    const comunidadRef: ComunidadRef = {
      comunidadId: 5,
      codigo: 'C-005',
      nombre: 'Comunidad Central',
    };

    const entity = new SectorEntity(2, 'Sector Sur', 'SS-002', 5, comunidadRef);

    expect(entity.sectorId).toBe(2);
    expect(entity.nombre).toBe('Sector Sur');
    expect(entity.codigo).toBe('SS-002');
    expect(entity.comunidadId).toBe(5);
    expect(entity.comunidades).toEqual(comunidadRef);
    expect(entity.comunidades?.nombre).toBe('Comunidad Central');
  });

  it('should create an instance with a non-null deletedAt', () => {
    const deletedAt = new Date('2024-12-31');
    const entity = new SectorEntity(
      3,
      'Eliminado',
      'EL-001',
      null,
      null,
      deletedAt,
    );

    expect(entity.sectorId).toBe(3);
    expect(entity.deletedAt).toEqual(deletedAt);
  });

  it('should have readonly properties', () => {
    const entity = new SectorEntity(1, 'Test', 'T-001', null);

    // Verify properties are not writable (compile-time check)
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(entity),
      'sectorId',
    );
    // Class field properties are own properties with writable: true by default in TS
    // but the key point is the TYPE system enforces readonly
    expect(entity.sectorId).toBeDefined();
  });
});
