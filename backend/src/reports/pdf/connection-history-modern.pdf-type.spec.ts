jest.mock('../../infrastructure/pdf/utils/pdf-logo-loader.util', () => ({
  getPdfLogoUrl: jest.fn(() => '/static/logo.png'),
}));

import { ConnectionHistoryModernPdfDocumentType } from './connection-history-modern.pdf-type';

describe('ConnectionHistoryModernPdfDocumentType', () => {
  const pdfType = ConnectionHistoryModernPdfDocumentType;

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
