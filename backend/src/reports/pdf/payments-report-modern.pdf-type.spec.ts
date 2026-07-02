jest.mock(
  '../../infrastructure/pdf/utils/pdf-logo-loader.util',
  () => ({
    getPdfLogoUrl: jest.fn(() => '/static/logo.png'),
  }),
);

import { PaymentsReportModernPdfDocumentType } from './payments-report-modern.pdf-type';

describe('PaymentsReportModernPdfDocumentType', () => {
  const pdfType = PaymentsReportModernPdfDocumentType;

  it('exposes the modern type, name, and template identifiers', () => {
    expect(pdfType.type).toBe('payments-report-modern');
    expect(pdfType.name).toBe('Reporte de Abonos (Moderno)');
    expect(pdfType.template).toBe('payments-report-modern');
  });

  it('exposes modern-only fields (logoUrl, totalGeneral, totalRegistros, fechaEmision)', () => {
    const raw = {
      pagos: [
        {
          factura: 'F-100',
          fecha: '01/04/2024',
          clienteNombre: 'Acme',
          cuenta: 'C-9',
          medidor: 'M-9',
          emision: '01/04/2024',
          valor: '99.99',
          valorNum: 99.99,
        },
      ],
      fechaDesde: '2024-04-01',
      fechaHasta: '2024-04-30',
      totalGeneral: '99.99',
      totalRegistros: 1,
    };

    const result = pdfType.adaptData(raw);

    expect(result['logoUrl']).toBe('/static/logo.png');
    const reporte = result['reporte'] as Record<string, unknown>;
    expect(reporte['titulo']).toBe('Reporte Detallado de Abonos');
    expect(reporte['totalGeneral']).toBe('99.99');
    expect(reporte['totalRegistros']).toBe(1);
    expect(reporte['fechaEmision']).toEqual(expect.any(String));
    expect((reporte['fechaEmision'] as string).length).toBeGreaterThan(0);
  });

  it('falls back to 0.00 / 0 when totalGeneral / totalRegistros are missing', () => {
    const result = pdfType.adaptData({ pagos: [] });
    const reporte = result['reporte'] as Record<string, unknown>;
    expect(reporte['totalGeneral']).toBe('0.00');
    expect(reporte['totalRegistros']).toBe(0);
  });

  it('groups rows by factura and accumulates subtotals identically to legacy', () => {
    const raw = {
      pagos: [
        {
          factura: 'F-A',
          fecha: '01/05/2024',
          clienteNombre: 'X',
          cuenta: 'C',
          medidor: 'M',
          emision: '01/05/2024',
          valor: '40.00',
          valorNum: 40,
        },
        {
          factura: 'F-A',
          fecha: '02/05/2024',
          clienteNombre: 'X',
          cuenta: 'C',
          medidor: 'M',
          emision: '02/05/2024',
          valor: '10.00',
          valorNum: 10,
        },
      ],
    };

    const result = pdfType.adaptData(raw);
    const grupos = (result['reporte'] as Record<string, unknown>)['grupos'] as Record<string, unknown>[];
    const fA = grupos.find((g) => g['factura'] === 'F-A');
    expect(fA?.['subtotal']).toBe('50.00');
    expect(fA?.['filas']).toHaveLength(2);
  });

  it('uses Number() coercion on valorNum to handle string inputs (legacy uses `as number`)', () => {
    const raw = {
      pagos: [
        {
          factura: 'F-X',
          fecha: '01/01/2024',
          clienteNombre: 'X',
          cuenta: 'C',
          medidor: 'M',
          emision: '01/01/2024',
          valor: '5.00',
          valorNum: '5',
        },
      ],
    };

    const result = pdfType.adaptData(raw);
    const grupos = (result['reporte'] as Record<string, unknown>)['grupos'] as Record<string, unknown>[];
    expect(grupos[0]?.['subtotal']).toBe('5.00');
  });
});
