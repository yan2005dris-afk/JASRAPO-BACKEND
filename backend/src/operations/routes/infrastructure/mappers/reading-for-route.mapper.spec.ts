import { ReadingForRouteMapper } from './reading-for-route.mapper';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';

describe('ReadingForRouteMapper', () => {
  describe('toEntity', () => {
    it('should map a reading with active contract to ReadingForRouteEntity', () => {
      const lectura = {
        lecturaId: 10n,
        medidor: {
          historial: [
            {
              fechaHasta: null,
              contrato: {
                numeroGuia: 'G-123',
                direccionSuministro: 'Calle Principal 456',
                estado: 'ACTIVO',
                cliente: { nombres: 'Juan', apellidos: 'Perez' },
                sector: { nombre: 'Sector Norte' },
              },
            },
          ],
        },
      };

      const result = ReadingForRouteMapper.toEntity(lectura);

      expect(result).toBeInstanceOf(ReadingForRouteEntity);
      expect(result.lecturaId).toBe(10n);
      expect(result.guia).toBe('G-123');
      expect(result.clienteNombre).toBe('Juan Perez');
      expect(result.direccion).toBe('Calle Principal 456');
      expect(result.sector).toBe('Sector Norte');
      expect(result.estadoContrato).toBe('ACTIVO');
    });

    it('should use fallback values when no active history exists', () => {
      const lectura = {
        lecturaId: 11n,
        medidor: {
          historial: [],
        },
      };

      const result = ReadingForRouteMapper.toEntity(lectura);

      expect(result.lecturaId).toBe(11n);
      expect(result.guia).toBe('Sin guía');
      expect(result.clienteNombre).toBe('Sin cliente');
      expect(result.direccion).toBe('Sin dirección');
      expect(result.sector).toBe('Sin sector');
      expect(result.estadoContrato).toBe('DESCONOCIDO');
    });

    it('should handle null medidor gracefully', () => {
      const lectura = {
        lecturaId: 12n,
        medidor: null,
      };

      const result = ReadingForRouteMapper.toEntity(lectura);

      expect(result.lecturaId).toBe(12n);
      expect(result.guia).toBe('Sin guía');
      expect(result.clienteNombre).toBe('Sin cliente');
    });

    it('should handle missing cliente gracefully', () => {
      const lectura = {
        lecturaId: 13n,
        medidor: {
          historial: [
            {
              fechaHasta: null,
              contrato: {
                numeroGuia: 'G-456',
                direccionSuministro: 'Av. Siempre Viva 742',
                estado: 'RECONEXION',
                sector: { nombre: 'Sector Sur' },
              },
            },
          ],
        },
      };

      const result = ReadingForRouteMapper.toEntity(lectura);

      expect(result.lecturaId).toBe(13n);
      expect(result.guia).toBe('G-456');
      expect(result.clienteNombre).toBe('Sin cliente');
      expect(result.direccion).toBe('Av. Siempre Viva 742');
      expect(result.sector).toBe('Sector Sur');
      expect(result.estadoContrato).toBe('RECONEXION');
    });

    it('should handle single-name client (no apellidos)', () => {
      const lectura = {
        lecturaId: 14n,
        medidor: {
          historial: [
            {
              fechaHasta: null,
              contrato: {
                numeroGuia: 'G-789',
                direccionSuministro: 'Calle 123',
                estado: 'ACTIVO',
                cliente: { nombres: 'María', apellidos: null },
                sector: { nombre: 'Centro' },
              },
            },
          ],
        },
      };

      const result = ReadingForRouteMapper.toEntity(lectura);

      expect(result.clienteNombre).toBe('María');
    });
  });
});
