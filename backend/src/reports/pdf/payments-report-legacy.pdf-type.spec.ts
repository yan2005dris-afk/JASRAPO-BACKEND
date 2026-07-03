import { PaymentsReportLegacyPdfDocumentType } from './payments-report-legacy.pdf-type';

describe('PaymentsReportLegacyPdfDocumentType', () => {
  const pdfType = PaymentsReportLegacyPdfDocumentType;

  it('exposes the legacy type, name, and template identifiers', () => {
    expect(pdfType.type).toBe('payments-report-legacy');
    expect(pdfType.name).toBe('Reporte de Abonos (Legacy)');
    expect(pdfType.template).toBe('payments-report-legacy');
  });

  it('groups rows by factura and accumulates subtotals', () => {
    const raw = {
      pagos: [
        {
          factura: 'F-001',
          fecha: '15/03/2024',
          clienteNombre: 'Acme',
          cuenta: 'C-1',
          medidor: 'M-1',
          emision: '01/03/2024',
          valor: '50.00',
          valorNum: 50,
        },
        {
          factura: 'F-001',
          fecha: '16/03/2024',
          clienteNombre: 'Acme',
          cuenta: 'C-1',
          medidor: 'M-1',
          emision: '02/03/2024',
          valor: '25.00',
          valorNum: 25,
        },
        {
          factura: 'F-002',
          fecha: '17/03/2024',
          clienteNombre: 'Acme',
          cuenta: 'C-1',
          medidor: 'M-1',
          emision: '03/03/2024',
          valor: '10.00',
          valorNum: 10,
        },
      ],
      fechaDesde: '2024-03-01',
      fechaHasta: '2024-03-31',
      totalGeneral: '85.00',
      totalRegistros: 3,
    };

    const result = pdfType.adaptData(raw);

    expect(result['reporte']).toBeDefined();
    const reporte = result['reporte'] as Record<string, unknown>;
    expect(reporte['titulo']).toBe('REPORTE DE ABONOS');
    expect(reporte['fechaDesde']).toBe('2024-03-01');
    expect(reporte['fechaHasta']).toBe('2024-03-31');
    const grupos = reporte['grupos'] as Record<string, unknown>[];
    expect(grupos).toHaveLength(2);
    const f001 = grupos.find((g) => g['factura'] === 'F-001');
    expect(f001?.['subtotal']).toBe('75.00');
    expect(f001?.['filas']).toHaveLength(2);
  });

  it('uses "--" placeholders when fechaDesde / fechaHasta are missing', () => {
    const result = pdfType.adaptData({ pagos: [] });
    const reporte = result['reporte'] as Record<string, unknown>;
    expect(reporte['fechaDesde']).toBe('--');
    expect(reporte['fechaHasta']).toBe('--');
    expect(reporte['grupos']).toEqual([]);
  });

  it('treats missing pagos as an empty array', () => {
    const result = pdfType.adaptData({});
    const reporte = result['reporte'] as Record<string, unknown>;
    expect(reporte['grupos']).toEqual([]);
  });
});
