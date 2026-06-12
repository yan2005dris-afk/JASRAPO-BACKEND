import { SectorMapper } from './sector.mapper';
import { SectorEntity } from '../../domain/entities/sector.entity';

describe('SectorMapper', () => {
  describe('toDomain', () => {
    it('should map a Prisma raw object to a SectorEntity', () => {
      const prismaRaw = {
        sectorId: 1,
        nombre: 'Sector Norte',
        codigo: 'SN-001',
        comunidadId: 10,
        comunidades: {
          comunidadId: 10,
          codigo: 'C-010',
          nombre: 'Comunidad Norte',
        },
        deletedAt: null,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-06-01T12:00:00Z'),
      };

      const entity = SectorMapper.toDomain(prismaRaw);

      expect(entity).toBeInstanceOf(SectorEntity);
      expect(entity.sectorId).toBe(1);
      expect(entity.nombre).toBe('Sector Norte');
      expect(entity.codigo).toBe('SN-001');
      expect(entity.comunidadId).toBe(10);
      expect(entity.comunidades?.nombre).toBe('Comunidad Norte');
      expect(entity.deletedAt).toBeNull();
      expect(entity.createdAt).toBe(prismaRaw.createdAt);
      expect(entity.updatedAt).toBe(prismaRaw.updatedAt);
    });

    it('should map a sector with soft delete timestamp', () => {
      const deletedAt = new Date('2024-12-31T23:59:00Z');
      const prismaRaw = {
        sectorId: 2,
        nombre: 'Sector Eliminado',
        codigo: 'SE-001',
        comunidadId: null,
        comunidades: null,
        deletedAt,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-06-01T00:00:00Z'),
      };

      const entity = SectorMapper.toDomain(prismaRaw);

      expect(entity.sectorId).toBe(2);
      expect(entity.comunidadId).toBeNull();
      expect(entity.comunidades).toBeNull();
      expect(entity.deletedAt).toEqual(deletedAt);
    });

    it('should map a sector without comunidades relation', () => {
      const prismaRaw = {
        sectorId: 3,
        nombre: 'Sector Sin Comunidad',
        codigo: 'SSC-001',
        comunidadId: null,
        deletedAt: null,
        createdAt: new Date('2024-03-01T00:00:00Z'),
        updatedAt: new Date('2024-03-01T00:00:00Z'),
      };

      const entity = SectorMapper.toDomain(prismaRaw);

      expect(entity.sectorId).toBe(3);
      expect(entity.comunidadId).toBeNull();
      expect(entity.comunidades).toBeUndefined();
    });
  });

  describe('toDomainList', () => {
    it('should map an array of Prisma raw objects', () => {
      const prismaRaws = [
        {
          sectorId: 1,
          nombre: 'Sector A',
          codigo: 'SA-001',
          comunidadId: 5,
          comunidades: { comunidadId: 5, codigo: 'C-005', nombre: 'Com A' },
          deletedAt: null,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-06-01T00:00:00Z'),
        },
        {
          sectorId: 2,
          nombre: 'Sector B',
          codigo: 'SB-001',
          comunidadId: null,
          deletedAt: null,
          createdAt: new Date('2024-02-01T00:00:00Z'),
          updatedAt: new Date('2024-06-01T00:00:00Z'),
        },
      ];

      const entities = SectorMapper.toDomainList(prismaRaws);

      expect(entities).toHaveLength(2);
      expect(entities[0]).toBeInstanceOf(SectorEntity);
      expect(entities[0].nombre).toBe('Sector A');
      expect(entities[1].nombre).toBe('Sector B');
    });
  });
});
