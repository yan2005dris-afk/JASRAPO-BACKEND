import { RouteMapper } from './route.mapper';
import { RouteEntity } from '../../domain/entities/route.entity';

describe('RouteMapper', () => {
  describe('toEntity', () => {
    it('should map all fields from a raw route to RouteEntity', () => {
      const fechaInicio = new Date('2025-06-02T08:00:00Z');
      const fechaFin = new Date('2025-06-02T16:00:00Z');

      const raw = {
        rutaId: 100n,
        nombre: 'Ruta Norte',
        descripcion: 'Descripción de prueba',
        operarioId: 5,
        tipoActividad: { codigo: 'LECTURA' },
        comunidadId: 1,
        sectorId: 2,
        periodoId: 5,
        estado: 'PENDIENTE',
        fechaInicio,
        fechaFin,
      };

      const result = RouteMapper.toEntity(raw);

      expect(result).toBeInstanceOf(RouteEntity);
      expect(result.rutaId).toBe(100n);
      expect(result.nombre).toBe('Ruta Norte');
      expect(result.descripcion).toBe('Descripción de prueba');
      expect(result.operarioId).toBe(5);
      expect(result.tipoRuta).toBe('LECTURA');
      expect(result.comunidadId).toBe(1);
      expect(result.sectorId).toBe(2);
      expect(result.periodoId).toBe(5);
      expect(result.estado).toBe('PENDIENTE');
      expect(result.fechaInicio).toBe('2025-06-02');
      expect(result.fechaFin).toBe('2025-06-02');
    });

    it('should handle null optional fields', () => {
      const raw = {
        rutaId: 101n,
        nombre: 'Ruta Test',
        descripcion: null,
        operarioId: 3,
        tipoActividad: { codigo: 'RECONEXION' },
        comunidadId: 2,
        sectorId: null,
        periodoId: null,
        estado: 'EN_CURSO',
        fechaInicio: null,
        fechaFin: null,
      };

      const result = RouteMapper.toEntity(raw);

      expect(result.descripcion).toBeNull();
      expect(result.sectorId).toBeNull();
      expect(result.periodoId).toBeNull();
      expect(result.fechaInicio).toBeNull();
      expect(result.fechaFin).toBeNull();
    });

    it('toEntityList should map an array of raw routes', () => {
      const raw = {
        rutaId: 102n,
        nombre: 'Minimal Route',
        operarioId: 1,
        tipoActividad: { codigo: 'LECTURA' },
        comunidadId: 1,
        estado: 'PENDIENTE',
      };

      const list = RouteMapper.toEntityList([raw]);

      expect(list).toHaveLength(1);
      expect(list[0].rutaId).toBe(102n);
      expect(list[0].nombre).toBe('Minimal Route');
    });
  });
});
