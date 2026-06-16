import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import {
  formatDate,
  formatMonthYear,
  formatCurrency,
  formatDateInWords,
  resolveClientName,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';

export const PaymentAgreementPdfDocumentType: PdfDocumentType = {
  type: 'payment-agreement',
  name: 'Convenio de Pago',
  template: 'payment-agreement',

  adaptData(raw: Record<string, any>): Record<string, any> {
    const c = raw.convenio ?? raw;
    const cliente = c.cliente ?? {};
    const contrato = c.contrato ?? {};

    return {
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
