import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { getPdfLogoUrl } from 'src/infrastructure/pdf/utils/pdf-logo-loader.util';
import type { PaymentAgreementReportDocument } from 'src/reports/application/read-models/payment-agreement.read-model';

export interface PaymentAgreementPdfViewModel extends PaymentAgreementReportDocument {
  logoUrl: string;
}

export const PaymentAgreementPdfDocumentType: PdfDocumentType<
  PaymentAgreementReportDocument,
  PaymentAgreementPdfViewModel
> = {
  type: 'payment-agreement',
  name: 'Convenio de Pago',
  template: 'payment-agreement',
  adaptData: (document) => ({ ...document, logoUrl: getPdfLogoUrl() }),
};
