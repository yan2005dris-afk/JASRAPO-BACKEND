import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';

export const SriDocumentPdfType: PdfDocumentType = {
  type: 'sri-document',
  name: 'Documento SRI',
  template: 'sri-document',
  adaptData(raw: Record<string, any>): Record<string, any> {
    return {
      title: raw.title || 'Documento SRI',
      data: raw,
      generatedAt: new Date().toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
      }),
    };
  },
};
