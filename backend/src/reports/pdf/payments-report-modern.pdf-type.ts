import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { currentDateLabel } from 'src/infrastructure/pdf/utils/pdf-format.utils';

import { getPdfLogoUrl } from 'src/infrastructure/pdf/utils/pdf-logo-loader.util';

export const PaymentsReportModernPdfDocumentType: PdfDocumentType = {
  type: 'payments-report-modern',
  name: 'Reporte de Abonos (Moderno)',
  template: 'payments-report-modern',

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
      group.subtotalNum += Number(row['valorNum'] ?? 0);
    }

    const grupos = Array.from(facturaMap.values()).map((g) => ({
      ...g,
      subtotal: g.subtotalNum.toFixed(2),
    }));

    return {
      logoUrl: getPdfLogoUrl(),
      reporte: {
        titulo: 'Reporte Detallado de Abonos',
        fechaDesde: raw['fechaDesde'] || '--',
        fechaHasta: raw['fechaHasta'] || '--',
        totalGeneral: raw['totalGeneral'] ?? '0.00',
        totalRegistros: raw['totalRegistros'] ?? 0,
        fechaEmision: currentDateLabel(),
        grupos,
      },
    };
  },
};
