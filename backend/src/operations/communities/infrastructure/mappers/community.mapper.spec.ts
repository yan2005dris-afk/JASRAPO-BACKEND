import { CommunityMapper } from './community.mapper';

describe('CommunityMapper', () => {
  describe('toDomain', () => {
    it('should return null for null input', () => {
      const result = CommunityMapper.toDomain(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = CommunityMapper.toDomain(undefined);
      expect(result).toBeNull();
    });

    it('should map a raw Prisma record without sector', () => {
      const raw = {
        comunidadId: 1,
        nombre: 'Test Community',
        codigo: 'TC-001',
        porcentajeTasaSeguridad: 5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      const result = CommunityMapper.toDomain(raw);

      expect(result).not.toBeNull();
      expect(result!.comunidadId).toBe(1);
      expect(result!.nombre).toBe('Test Community');
      expect(result!.codigo).toBe('TC-001');
      expect(result!.porcentajeTasaSeguridad).toBe(5);
      expect(result!.sectores).toBeUndefined();
      expect(result!.deletedAt).toBeNull();
    });

    it('should convert Decimal porcentajeTasaSeguridad to number', () => {
      const raw = {
        comunidadId: 2,
        nombre: 'Decimal Rate',
        codigo: 'DR-001',
        porcentajeTasaSeguridad: '5.50', // Prisma can return Decimal as string
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const result = CommunityMapper.toDomain(raw);
      expect(result!.porcentajeTasaSeguridad).toBe(5.5);
    });

    it('should set porcentajeTasaSeguridad to null when null in raw', () => {
      const raw = {
        comunidadId: 3,
        nombre: 'Null Rate',
        codigo: 'NR-001',
        porcentajeTasaSeguridad: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const result = CommunityMapper.toDomain(raw);
      expect(result!.porcentajeTasaSeguridad).toBeNull();
    });

    it('should map sectores from sector relation array', () => {
      const raw = {
        comunidadId: 4,
        nombre: 'With Sectors',
        codigo: 'WS-001',
        porcentajeTasaSeguridad: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        sector: [
          { sectorId: 1, nombre: 'Sector A', codigo: 'SA-001' },
          { sectorId: 2, nombre: 'Sector B', codigo: 'SB-002' },
        ],
      };

      const result = CommunityMapper.toDomain(raw);

      expect(result!.sectores).toHaveLength(2);
      expect(result!.sectores![0]).toEqual({
        sectorId: 1,
        nombre: 'Sector A',
        codigo: 'SA-001',
      });
      expect(result!.sectores![1]).toEqual({
        sectorId: 2,
        nombre: 'Sector B',
        codigo: 'SB-002',
      });
    });

    it('should handle empty sector array', () => {
      const raw = {
        comunidadId: 5,
        nombre: 'Empty Sector',
        codigo: 'ES-001',
        porcentajeTasaSeguridad: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        sector: [],
      };

      const result = CommunityMapper.toDomain(raw);
      expect(result!.sectores).toHaveLength(0);
    });
  });

  describe('toDomainList', () => {
    it('should map a list of raw records', () => {
      const rawList = [
        {
          comunidadId: 1,
          nombre: 'Community 1',
          codigo: 'C1',
          porcentajeTasaSeguridad: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          comunidadId: 2,
          nombre: 'Community 2',
          codigo: 'C2',
          porcentajeTasaSeguridad: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      const result = CommunityMapper.toDomainList(rawList);

      expect(result).toHaveLength(2);
      expect(result[0].comunidadId).toBe(1);
      expect(result[1].comunidadId).toBe(2);
    });

    it('should filter out null entries', () => {
      const rawList = [
        {
          comunidadId: 1,
          nombre: 'Community 1',
          codigo: 'C1',
          porcentajeTasaSeguridad: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        null,
      ];

      const result = CommunityMapper.toDomainList(rawList);

      expect(result).toHaveLength(1);
      expect(result[0].comunidadId).toBe(1);
    });
  });
});
