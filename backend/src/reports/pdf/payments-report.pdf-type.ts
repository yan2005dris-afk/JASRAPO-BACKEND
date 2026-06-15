import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import {
  buildRangoFechas,
  currentDateLabel,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';

export const PaymentsReportPdfDocumentType: PdfDocumentType = {
  type: 'payments-report',
  name: 'Reporte de Abonos',
  template: 'payments-report',

  adaptData(raw: Record<string, unknown>): Record<string, unknown> {
    const rows = (raw['pagos'] as Record<string, unknown>[]) ?? [];

    // Group rows by factura to build subtotal rows
    const facturaMap = new Map<
      string,
      { rows: Record<string, unknown>[]; subtotal: number }
    >();
    for (const row of rows) {
      const key = row['factura'] as string;
      if (!facturaMap.has(key)) {
        facturaMap.set(key, { rows: [], subtotal: 0 });
      }
      const group = facturaMap.get(key)!;
      group.rows.push(row);
      group.subtotal += row['valorNum'] as number;
    }

    // Flatten into display rows with subtotal separators
    const filas: Record<string, unknown>[] = [];
    let rowIndex = 0;
    for (const [factura, group] of facturaMap) {
      for (const row of group.rows) {
        filas.push({
          ...row,
          displayIndex: rowIndex + 1,
          isData: true,
        });
        rowIndex++;
      }
      filas.push({
        factura,
        isSubtotal: true,
        subtotalValor: group.subtotal.toFixed(2),
      });
    }

    return {
      reporte: {
        titulo: 'Reporte de Abonos',
        fechaEmision: currentDateLabel(),
        rangoFechas: buildRangoFechas(
          raw['fechaDesde'] as string | null,
          raw['fechaHasta'] as string | null,
        ),
        totalGeneral: raw['totalGeneral'] ?? '0.00',
        totalRegistros: raw['totalRegistros'] ?? 0,
        filas,
      },
    };
  },
};
