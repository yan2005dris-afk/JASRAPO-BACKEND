import type { ComunidadRef } from './sector.entity';
import { SectorEntity } from './sector.entity';

describe('SectorEntity', () => {
  it('should create an instance with all required fields', () => {
    const entity = new SectorEntity({
      sectorId: 1,
      nombre: 'Sector Norte',
      codigo: 'SN-001',
      comunidadId: 10,
      comunidades: null,
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-06-01'),
    });

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

    const entity = new SectorEntity({
      sectorId: 2,
      nombre: 'Sector Sur',
      codigo: 'SS-002',
      comunidadId: 5,
      comunidades: comunidadRef,
    });

    expect(entity.sectorId).toBe(2);
    expect(entity.nombre).toBe('Sector Sur');
    expect(entity.codigo).toBe('SS-002');
    expect(entity.comunidadId).toBe(5);
    expect(entity.comunidades).toEqual(comunidadRef);
    expect(entity.comunidades?.nombre).toBe('Comunidad Central');
  });

  it('should create an instance with a non-null deletedAt', () => {
    const deletedAt = new Date('2024-12-31');
    const entity = new SectorEntity({
      sectorId: 3,
      nombre: 'Eliminado',
      codigo: 'EL-001',
      comunidadId: null,
      comunidades: null,
      deletedAt: deletedAt,
    });

    expect(entity.sectorId).toBe(3);
    expect(entity.deletedAt).toEqual(deletedAt);
  });

  it('should throw error when invariants are violated', () => {
    expect(() => new SectorEntity({ sectorId: 1, nombre: '   ', codigo: 'T-001' })).toThrow(
      'El nombre del sector no puede estar vacío',
    );
  });
});
