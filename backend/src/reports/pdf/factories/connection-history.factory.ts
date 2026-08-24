import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { getPdfLogoUrl } from 'src/infrastructure/pdf/utils/pdf-logo-loader.util';
import type { ConnectionHistoryReportDocument } from '../../application/read-models/connection-history.read-model';

export type ConnectionHistoryStyle = 'legacy' | 'modern';

export interface ConnectionHistoryPdfViewModel extends ConnectionHistoryReportDocument {
  logoUrl?: string;
}

export function createConnectionHistoryPdfDocumentType(
  style: ConnectionHistoryStyle,
): PdfDocumentType<
  ConnectionHistoryReportDocument,
  ConnectionHistoryPdfViewModel
> {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'connection-history-legacy' : 'connection-history-modern',
    name: isLegacy
      ? 'Historial de Conexión (Legacy)'
      : 'Historial de Conexión (Moderno)',
    template: isLegacy
      ? 'connection-history-legacy'
      : 'connection-history-modern',
    adaptData: (document) => ({
      ...document,
      ...(isLegacy ? {} : { logoUrl: getPdfLogoUrl() }),
      reporte: {
        ...document.reporte,
        titulo: isLegacy
          ? 'REPORTE HISTORIAL DE CONEXION'
          : 'Historial de Conexión Detallado',
      },
    }),
  };
}
