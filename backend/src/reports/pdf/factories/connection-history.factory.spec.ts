jest.mock('src/infrastructure/pdf/utils/pdf-logo-loader.util', () => ({
  getPdfLogoUrl: jest.fn(() => '/static/logo.png'),
}));

import { createConnectionHistoryPdfDocumentType } from './connection-history.factory';

describe('createConnectionHistoryPdfDocumentType', () => {
  describe('legacy style', () => {
    const pdfType = createConnectionHistoryPdfDocumentType('legacy');

    it('exposes the legacy type, name, and template identifiers', () => {
      expect(pdfType.type).toBe('connection-history-legacy');
      expect(pdfType.name).toBe('Historial de Conexión (Legacy)');
      expect(pdfType.template).toBe('connection-history-legacy');
    });

    it('does not include logoUrl', () => {
      const result = pdfType.adaptData({
        contratoId: '42',
        prefacturas: [],
      });
      expect(result['logoUrl']).toBeUndefined();
    });

    it('renders a single-row report with header + footer totals', () => {
      const raw = {
        contratoId: '42',
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-06-30',
        prefacturas: [
          {
            periodoRel: { nombre: 'Enero 2024' },
            lecturaActual: 100,
            lecturaAnterior: 90,
            consumoM3: 10,
            totalPagar: 25.5,
            abono: 25.5,
            saldoActual: 0,
            contrato: {
              cliente: { razonSocial: 'Acme S.A.', identificacion: '1790000000' },
              historialMedidores: [{ medidor: { serie: 'M-001' } }],
            },
          },
          {
            periodoRel: { nombre: 'Febrero 2024' },
            lecturaActual: 110,
            lecturaAnterior: 100,
            consumoM3: 10,
            totalPagar: 26,
            abono: 0,
            saldoActual: 26,
            contrato: {
              cliente: { razonSocial: 'Acme S.A.', identificacion: '1790000000' },
              historialMedidores: [{ medidor: { serie: 'M-001' } }],
            },
          },
        ],
      };

      const result = pdfType.adaptData(raw);
      const reporte = result['reporte'] as Record<string, unknown>;

      expect(reporte['titulo']).toBe('REPORTE HISTORIAL DE CONEXION');
      expect(reporte['cuenta']).toBe('42');
      expect(reporte['clienteNombre']).toBe('Acme S.A.');
      expect(reporte['medidor']).toBe('M-001');
      expect(reporte['totalValEmision']).toBe('51.50');
      expect(reporte['totalAbonos']).toBe('25.50');
      expect(reporte['saldoFinal']).toBe('26.00');
      expect(reporte['fechaDesde']).toBe('2024-01-01');
      expect(reporte['fechaHasta']).toBe('2024-06-30');
      expect(reporte['fechaEmision']).toEqual(expect.any(String));

      const filas = reporte['filas'] as Record<string, unknown>[];
      expect(filas).toHaveLength(2);
      expect(filas[0]?.['emision']).toBe('Enero 2024');
      expect(filas[0]?.['lectActual']).toBe('100');
      expect(filas[0]?.['valEmision']).toBe('25.50');
    });

    it('emits "—" placeholders when no prefacturas are present', () => {
      const result = pdfType.adaptData({ contratoId: '42' });
      const reporte = result['reporte'] as Record<string, unknown>;
      expect(reporte['clienteNombre']).toBe('—');
      expect(reporte['medidor']).toBe('—');
      expect(reporte['cuenta']).toBe('42');
      expect(reporte['totalValEmision']).toBe('0.00');
      expect(reporte['totalAbonos']).toBe('0.00');
      expect(reporte['saldoFinal']).toBe('0.00');
      expect(reporte['filas']).toEqual([]);
    });

    it('handles string/null numeric inputs defensively (Number(…) with fallbacks)', () => {
      const raw = {
        contratoId: '7',
        prefacturas: [
          {
            periodoRel: { nombre: 'Marzo 2024' },
            lecturaActual: null,
            lecturaAnterior: undefined,
            consumoM3: '8',
            totalPagar: undefined,
            abono: null,
            saldoActual: '15',
            contrato: { cliente: {}, historialMedidores: [] },
          },
        ],
      };

      const result = pdfType.adaptData(raw);
      const filas = (result['reporte'] as Record<string, unknown>)[
        'filas'
      ] as Record<string, unknown>[];
      expect(filas[0]?.['lectActual']).toBe('0');
      expect(filas[0]?.['consumo']).toBe('8');
      expect(filas[0]?.['valEmision']).toBe('0.00');
      expect(filas[0]?.['abonos']).toBe('0.00');
    });
  });

  describe('modern style', () => {
    const pdfType = createConnectionHistoryPdfDocumentType('modern');

    it('exposes the modern type, name, and template identifiers', () => {
      expect(pdfType.type).toBe('connection-history-modern');
      expect(pdfType.name).toBe('Historial de Conexión (Moderno)');
      expect(pdfType.template).toBe('connection-history-modern');
    });

    it('exposes modern-only field logoUrl and uses sentence-cased title', () => {
      const raw = {
        contratoId: '99',
        prefacturas: [
          {
            periodoRel: { nombre: 'Mayo 2024' },
            lecturaActual: 200,
            lecturaAnterior: 180,
            consumoM3: 20,
            totalPagar: 60,
            abono: 60,
            saldoActual: 0,
            contrato: {
              cliente: {
                nombres: 'Juan',
                apellidos: 'Pérez',
                identificacion: '1799999999',
              },
              historialMedidores: [{ medidor: { serie: 'M-202' } }],
            },
          },
        ],
      };

      const result = pdfType.adaptData(raw);
      expect(result['logoUrl']).toBe('/static/logo.png');
      const reporte = result['reporte'] as Record<string, unknown>;
      expect(reporte['titulo']).toBe('Historial de Conexión Detallado');
      expect(reporte['clienteNombre']).toBe('Juan Pérez');
      expect(reporte['medidor']).toBe('M-202');
      expect(reporte['saldoFinal']).toBe('0.00');
    });

    it('aggregates totals across all prefacturas (same math as legacy)', () => {
      const raw = {
        contratoId: '88',
        prefacturas: [
          {
            periodoRel: { nombre: 'A' },
            lecturaActual: 10,
            lecturaAnterior: 5,
            consumoM3: 5,
            totalPagar: 12.5,
            abono: 12.5,
            saldoActual: 0,
            contrato: { cliente: {}, historialMedidores: [] },
          },
          {
            periodoRel: { nombre: 'B' },
            lecturaActual: 20,
            lecturaAnterior: 10,
            consumoM3: 10,
            totalPagar: 25,
            abono: 0,
            saldoActual: 25,
            contrato: { cliente: {}, historialMedidores: [] },
          },
        ],
      };

      const result = pdfType.adaptData(raw);
      const reporte = result['reporte'] as Record<string, unknown>;
      expect(reporte['totalValEmision']).toBe('37.50');
      expect(reporte['totalAbonos']).toBe('12.50');
      expect(reporte['saldoFinal']).toBe('25.00');
    });

    it('falls back to "—" for missing header fields', () => {
      const result = pdfType.adaptData({});
      const reporte = result['reporte'] as Record<string, unknown>;
      expect(reporte['cuenta']).toBe('—');
      expect(reporte['clienteNombre']).toBe('—');
      expect(reporte['medidor']).toBe('—');
      expect(reporte['filas']).toEqual([]);
    });
  });
});
