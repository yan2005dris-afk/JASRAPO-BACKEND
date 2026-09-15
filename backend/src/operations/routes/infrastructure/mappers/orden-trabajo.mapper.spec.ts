import { OrdenTrabajoMapper } from './orden-trabajo.mapper';
import { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';

describe('OrdenTrabajoMapper', () => {
  describe('toEntity', () => {
    it('should map all fields from a raw record to OrdenTrabajoEntity', () => {
      const createdAt = new Date('2025-06-01T10:00:00Z');
      const updatedAt = new Date('2025-06-02T10:00:00Z');
      const completadoEn = new Date('2025-06-03T15:30:00Z');

      const raw = {
        ordenTrabajoId: 100n,
        rutaId: 5n,
        contratoId: 50n,
        medidorId: 200n,
        ruta: { activityType: { codigo: 'INSTALACION' } },
        estado: 'COMPLETADA',
        ordenVisita: 3,
        resultadoObservacion: 'Trabajo terminado sin novedades',
        evidenciaFotoUrl: 'https://storage.example.com/evidencia.jpg',
        completadoEn,
        createdAt,
        updatedAt,
        deletedAt: null,
        lecturaId: 999n,
        contratoNumeroContrato: 'G-0001',
        contratoClienteNombre: 'Juan Pérez',
        contratoDireccion: 'Av. Amazonas 123',
        medidorNumeroSerie: 'SER-1234',
        lecturaLecturaId: 999n,
      };

      const result = OrdenTrabajoMapper.toEntity(raw);

      expect(result).toBeInstanceOf(OrdenTrabajoEntity);
      expect(result.ordenTrabajoId).toBe(100n);
      expect(result.rutaId).toBe(5n);
      expect(result.contratoId).toBe(50n);
      expect(result.medidorId).toBe(200n);
      expect(result.tipoActividad).toBe('INSTALACION');
      expect(result.estado).toBe('COMPLETADA');
      expect(result.ordenVisita).toBe(3);
      expect(result.resultadoObservacion).toBe(
        'Trabajo terminado sin novedades',
      );
      expect(result.evidenciaFotoUrl).toBe(
        'https://storage.example.com/evidencia.jpg',
      );
      expect(result.completadoEn).toBe(completadoEn);
      expect(result.createdAt).toBe(createdAt);
      expect(result.updatedAt).toBe(updatedAt);
      expect(result.deletedAt).toBeNull();
      expect(result.lecturaId).toBe(999n);
      expect(result.contratoNumeroContrato).toBe('G-0001');
      expect(result.contratoClienteNombre).toBe('Juan Pérez');
      expect(result.contratoDireccion).toBe('Av. Amazonas 123');
      expect(result.medidorNumeroSerie).toBe('SER-1234');
      expect(result.lecturaLecturaId).toBe(999n);
    });

    it('should default missing optional fields to null', () => {
      const raw = {
        ordenTrabajoId: 200n,
        rutaId: 1n,
        contratoId: 1n,
        ruta: { activityType: { codigo: 'INSPECCION' } },
        estado: 'PENDIENTE',
        ordenVisita: 1,
      };

      const result = OrdenTrabajoMapper.toEntity(raw);

      expect(result.medidorId).toBeNull();
      expect(result.resultadoObservacion).toBeNull();
      expect(result.evidenciaFotoUrl).toBeNull();
      expect(result.completadoEn).toBeNull();
      expect(result.deletedAt).toBeNull();
      expect(result.lecturaId).toBeNull();
      expect(result.contratoNumeroContrato).toBeNull();
      expect(result.contratoClienteNombre).toBeNull();
      expect(result.contratoDireccion).toBeNull();
      expect(result.medidorNumeroSerie).toBeNull();
      expect(result.lecturaLecturaId).toBeNull();
      // createdAt and updatedAt fall back to current Date
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle explicit null values without throwing', () => {
      const raw = {
        ordenTrabajoId: 300n,
        rutaId: 1n,
        contratoId: 1n,
        medidorId: null,
        ruta: { activityType: { codigo: 'RECONEXION' } },
        estado: 'FALLIDA',
        ordenVisita: 2,
        resultadoObservacion: null,
        evidenciaFotoUrl: null,
        completadoEn: null,
        deletedAt: null,
        lecturaId: null,
        contratoNumeroContrato: null,
        contratoClienteNombre: null,
        contratoDireccion: null,
        medidorNumeroSerie: null,
        lecturaLecturaId: null,
      };

      const result = OrdenTrabajoMapper.toEntity(raw);

      expect(result.medidorId).toBeNull();
      expect(result.completadoEn).toBeNull();
      expect(result.lecturaId).toBeNull();
      expect(result.contratoNumeroContrato).toBeNull();
    });
  });

  describe('toEntityList', () => {
    it('should map an array of raw records', () => {
      const rawList = [
        {
          ordenTrabajoId: 1n,
          rutaId: 1n,
          contratoId: 1n,
          ruta: { activityType: { codigo: 'INSTALACION' } },
          estado: 'PENDIENTE',
          ordenVisita: 1,
        },
        {
          ordenTrabajoId: 2n,
          rutaId: 1n,
          contratoId: 1n,
          ruta: { activityType: { codigo: 'INSPECCION' } },
          estado: 'COMPLETADA',
          ordenVisita: 2,
        },
      ];

      const result = OrdenTrabajoMapper.toEntityList(rawList);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(OrdenTrabajoEntity);
      expect(result[0].ordenTrabajoId).toBe(1n);
      expect(result[0].tipoActividad).toBe('INSTALACION');
      expect(result[1].ordenTrabajoId).toBe(2n);
      expect(result[1].tipoActividad).toBe('INSPECCION');
    });

    it('should return empty array for empty input', () => {
      expect(OrdenTrabajoMapper.toEntityList([])).toEqual([]);
    });
  });
});
