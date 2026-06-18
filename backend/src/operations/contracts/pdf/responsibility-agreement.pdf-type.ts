import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { resolveClientName } from 'src/infrastructure/pdf/utils/pdf-format.utils';

export const ResponsibilityAgreementPdfDocumentType: PdfDocumentType = {
  type: 'responsibility-agreement',
  name: 'Acta de Compromiso',
  template: 'responsibility-agreement',

  adaptData(raw: Record<string, any>): Record<string, any> {
    const a = raw.acta ?? raw;
    const cliente = a.cliente ?? {};

    return {
      acta: {
        clienteNombre: resolveClientName(cliente),
        identificacion: cliente.identificacion ?? '',
        fechaFirmado: a.fechaFirmado ?? '',
      },
    };
  },
};
