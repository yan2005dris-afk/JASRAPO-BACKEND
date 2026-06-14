import { RouteMapper } from './route.mapper';
import { RouteEntity } from '../../domain/entities/route.entity';

describe('RouteMapper', () => {
  describe('toEntity', () => {
    it('should map all fields from a raw route to RouteEntity', () => {
      const createdAt = new Date('2025-06-01T10:00:00Z');
      const fechaInicio = new Date('2025-06-02T08:00:00Z');
      const fechaFin = new Date('2025-06-02T16:00:00Z');

      const raw = {
        rutaId: 100n,
        nombre: 'Ruta Norte',
        descripcion: 'Descripción de prueba',
        operarioId: 5,
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        sectorId: 2,
        periodoId: 5,
        estado: 'PENDIENTE',
        createdAt,
        fechaInicio,
        fechaFin,
      };

      const result = RouteMapper.toEntity(raw);

      expect(result).toBeInstanceOf(RouteEntity);
      expect(result.rutaId).toBe(100n);
      expect(result.nombre).toBe('Ruta Norte');
      expect(result.descripcion).toBe('Descripción de prueba');
      expect(result.operarioId).toBe(5);
      expect(result.tipoRuta).toBe('TOMA_LECTURA');
      expect(result.comunidadId).toBe(1);
      expect(result.sectorId).toBe(2);
      expect(result.periodoId).toBe(5);
      expect(result.estado).toBe('PENDIENTE');
      expect(result.fechaPlanificada).toBe('2025-06-01');
      expect(result.fechaInicio).toBe('2025-06-02');
      expect(result.fechaFin).toBe('2025-06-02');
    });

    it('should handle null optional fields', () => {
      const createdAt = new Date('2025-06-01T10:00:00Z');

      const raw = {
        rutaId: 101n,
        nombre: 'Ruta Test',
        descripcion: null,
        operarioId: 3,
        tipoRuta: 'RECONEXION',
        comunidadId: 2,
        sectorId: null,
        periodoId: null,
        estado: 'EN_CURSO',
        createdAt,
        fechaInicio: null,
        fechaFin: null,
      };

      const result = RouteMapper.toEntity(raw);

      expect(result.descripcion).toBeNull();
      expect(result.sectorId).toBeNull();
      expect(result.periodoId).toBeNull();
      expect(result.fechaPlanificada).toBe('2025-06-01');
      expect(result.fechaInicio).toBeNull();
      expect(result.fechaFin).toBeNull();
    });

    it('should handle missing optional properties gracefully', () => {
      const createdAt = new Date('2025-06-01T10:00:00Z');

      const raw = {
        rutaId: 102n,
        nombre: 'Minimal Route',
        operarioId: 1,
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        estado: 'PENDIENTE',
        createdAt,
      };

      const result = RouteMapper.toEntity(raw);

      expect(result.rutaId).toBe(102n);
      expect(result.nombre).toBe('Minimal Route');
    });
  });
});
