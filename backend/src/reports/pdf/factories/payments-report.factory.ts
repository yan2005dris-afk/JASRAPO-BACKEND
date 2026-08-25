import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import type { PaymentsReportDocument } from '../../application/read-models/payments-report.read-model';

export type PaymentsReportStyle = 'legacy' | 'modern';

export type PaymentsReportPdfViewModel = PaymentsReportDocument;

export function createPaymentsReportPdfDocumentType(
  style: PaymentsReportStyle,
): PdfDocumentType<PaymentsReportDocument, PaymentsReportPdfViewModel> {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'payments-report-legacy' : 'payments-report-modern',
    name: isLegacy
      ? 'Reporte de Abonos (Legacy)'
      : 'Reporte de Abonos (Moderno)',
    template: isLegacy ? 'payments-report-legacy' : 'payments-report-modern',
    adaptData: (document) => ({
      ...document,
      reporte: {
        ...document.reporte,
        titulo: isLegacy ? 'REPORTE DE ABONOS' : 'Reporte Detallado de Abonos',
      },
    }),
  };
}
