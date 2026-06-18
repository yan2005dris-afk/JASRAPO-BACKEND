import { IdentificacionMapper } from './identificacion.mapper';

describe('IdentificacionMapper', () => {
  describe('toDomain', () => {
    it('should return null when raw is null', () => {
      expect(IdentificacionMapper.toDomain(null)).toBeNull();
    });

    it('should return null when raw is undefined', () => {
      expect(IdentificacionMapper.toDomain(undefined)).toBeNull();
    });

    it('should map a complete Prisma record', () => {
      const raw = {
        id: 1,
        codigo: '05',
        descripcion: 'CÉDULA',
        activo: true,
      };

      const result = IdentificacionMapper.toDomain(raw);

      expect(result).toEqual({
        id: 1,
        codigo: '05',
        descripcion: 'CÉDULA',
        activo: true,
      });
    });

    it('should map record with activo false', () => {
      const raw = {
        id: 2,
        codigo: '04',
        descripcion: 'RUC',
        activo: false,
      };

      const result = IdentificacionMapper.toDomain(raw);

      expect(result).toEqual({
        id: 2,
        codigo: '04',
        descripcion: 'RUC',
        activo: false,
      });
    });
  });
});
