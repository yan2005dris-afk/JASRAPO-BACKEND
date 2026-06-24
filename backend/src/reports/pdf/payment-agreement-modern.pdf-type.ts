import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import {
  formatDate,
  formatMonthYear,
  formatCurrency,
  formatDateInWords,
  resolveClientName,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';

import { getPdfLogoUrl } from 'src/infrastructure/pdf/utils/pdf-logo-loader.util';

export const PaymentAgreementModernPdfDocumentType: PdfDocumentType = {
  type: 'payment-agreement-modern',
  name: 'Acuerdo de Pago (Moderno)',
  template: 'payment-agreement-modern',

  adaptData(raw: Record<string, any>): Record<string, any> {
    const c = raw.convenio ?? raw;
    const cliente = c.cliente ?? {};
    const contrato = c.contrato ?? {};

    return {
      logoUrl: getPdfLogoUrl(),
      convenio: {
        fecha: formatDate(c.createdAt),
        numeroGuia: contrato.numeroGuia ?? '',
        clienteNombre: resolveClientName(cliente),
        clienteCI: cliente.identificacion ?? '',
        cuotaMensual: formatCurrency(Number(c.cuotaMensual ?? 0)),
        deudaTotal: formatCurrency(Number(c.deudaTotal ?? 0)),
        abonoInicial: formatCurrency(Number(c.abonoInicial ?? 0)),
        numeroCuotas: c.numeroCuotas ?? 0,
        mesPrimerPago: formatMonthYear(c.fechaPrimerPago),
        fechaActual: formatDateInWords(c.createdAt),
      },
    };
  },
};
