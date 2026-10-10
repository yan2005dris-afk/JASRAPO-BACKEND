import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import type { PaymentAgreementReportDocument } from '../../application/read-models/payment-agreement.read-model';

export type PaymentAgreementPdfViewModel = PaymentAgreementReportDocument;

export const PaymentAgreementPdfDocumentType: PdfDocumentType<
  PaymentAgreementReportDocument,
  PaymentAgreementPdfViewModel
> = {
  type: 'payment-agreement',
  name: 'Convenio de Pago',
  template: 'payment-agreement',
  adaptData: (document) => document,
};
