import { BusquedaPublicaMapper } from './busqueda-publica.mapper';

describe('BusquedaPublicaMapper', () => {
  describe('cliente', () => {
    it('should map a raw cliente to SearchResultEntity with tipo=cliente', () => {
      const raw = {
        clienteId: 1,
        identificacion: '12345678',
        nombres: 'Juan',
        apellidos: 'Perez',
        telefono: '999888777',
        email: 'juan@test.com',
      };

      const result = BusquedaPublicaMapper.cliente(raw);

      expect(result.tipo).toBe('cliente');
      expect(result.id).toBe('1');
      expect(result.label).toBe('Juan Perez');
      expect(result.extra).toEqual({
        identificacion: '12345678',
        telefono: '999888777',
        email: 'juan@test.com',
      });
    });

    it('should handle null nombres producing Sin nombre', () => {
      const raw = {
        clienteId: 2,
        identificacion: '87654321',
        nombres: null,
        apellidos: null,
        telefono: null,
        email: null,
      };

      const result = BusquedaPublicaMapper.cliente(raw);

      expect(result.tipo).toBe('cliente');
      expect(result.label).toBe('Sin nombre');
      expect(result.extra).toEqual({
        identificacion: '87654321',
        telefono: null,
        email: null,
      });
    });

    it('should use only available name parts', () => {
      const raw = {
        clienteId: 3,
        identificacion: '11223344',
        nombres: 'Maria',
        apellidos: null,
        telefono: null,
        email: null,
      };

      const result = BusquedaPublicaMapper.cliente(raw);

      expect(result.label).toBe('Maria');
    });
  });

  describe('contrato', () => {
    it('should map a raw contrato to SearchResultEntity with tipo=contrato', () => {
      const raw = {
        contratoId: 42,
        numeroGuia: 'G-2024-001',
        estado: 'ACTIVO',
        direccionSuministro: 'Av. Siempre Viva 123',
        cliente: {
          identificacion: '12345678',
          nombres: 'Juan',
          apellidos: 'Perez',
        },
      };

      const result = BusquedaPublicaMapper.contrato(raw);

      expect(result.tipo).toBe('contrato');
      expect(result.id).toBe('42');
      expect(result.label).toBe('G-2024-001');
      expect(result.extra).toEqual({
        cliente: 'Juan Perez',
        identificacionCliente: '12345678',
        estado: 'ACTIVO',
        direccion: 'Av. Siempre Viva 123',
      });
    });

    it('should handle null contrato fields producing Sin número de guía', () => {
      const raw = {
        contratoId: 0,
        numeroGuia: null,
        estado: null,
        direccionSuministro: null,
        cliente: null,
      };

      const result = BusquedaPublicaMapper.contrato(raw);

      expect(result.tipo).toBe('contrato');
      expect(result.label).toBe('Sin número de guía');
      expect(result.extra).toEqual({
        cliente: null,
        identificacionCliente: null,
        estado: null,
        direccion: null,
      });
    });

    it('should handle contrato without cliente relation', () => {
      const raw = {
        contratoId: 10,
        numeroGuia: 'C-001',
        estado: 'PENDIENTE',
        direccionSuministro: 'Calle 123',
        cliente: null,
      };

      const result = BusquedaPublicaMapper.contrato(raw);

      expect(result.tipo).toBe('contrato');
      expect(result.label).toBe('C-001');
      expect(result.extra.cliente).toBeNull();
      expect(result.extra.identificacionCliente).toBeNull();
    });
  });
});
