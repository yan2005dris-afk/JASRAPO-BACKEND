import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import {
  buildRangoFechas,
  currentDateLabel,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';

export const PaymentsReportLegacyPdfDocumentType: PdfDocumentType = {
  type: 'payments-report-legacy',
  name: 'Reporte de Abonos (Legacy)',
  template: 'payments-report-legacy',

  adaptData(raw: Record<string, unknown>): Record<string, unknown> {
    const rows = (raw['pagos'] as Record<string, unknown>[]) ?? [];

    const facturaMap = new Map<string, any>();

    for (const row of rows) {
      const key = row['factura'] as string;
      if (!facturaMap.has(key)) {
        facturaMap.set(key, {
          factura: key,
          fecha: row['fecha'],
          clienteNombre: row['clienteNombre'],
          cuenta: row['cuenta'],
          medidor: row['medidor'],
          subtotalNum: 0,
          filas: [],
        });
      }
      const group = facturaMap.get(key)!;
      group.filas.push({
        emision: row['emision'],
        valor: row['valor'],
      });
      group.subtotalNum += row['valorNum'] as number;
    }

    const grupos = Array.from(facturaMap.values()).map((g) => ({
      ...g,
      subtotal: g.subtotalNum.toFixed(2),
    }));

    return {
      reporte: {
        titulo: 'REPORTE DE ABONOS',
        fechaDesde: raw['fechaDesde'] || '--',
        fechaHasta: raw['fechaHasta'] || '--',
        grupos,
      },
    };
  },
};
