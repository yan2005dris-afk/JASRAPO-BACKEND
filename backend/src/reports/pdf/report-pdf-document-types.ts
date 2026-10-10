import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { PaymentAgreementPdfDocumentType } from './factories/payment-agreement.factory';
import { createAccountStatementPdfDocumentType } from './factories/account-statement.factory';
import { createClientsListPdfDocumentType } from './factories/clients-list.factory';
import { createConnectionHistoryPdfDocumentType } from './factories/connection-history.factory';
import { createOverdueAccountsPdfDocumentType } from './factories/overdue-accounts.factory';
import { createPaymentsReportPdfDocumentType } from './factories/payments-report.factory';

/** Official report document types registered by ReportsModule. */
export const REPORT_PDF_DOCUMENT_TYPES: readonly PdfDocumentType<
  never,
  object
>[] = [
  createClientsListPdfDocumentType('legacy'),
  createClientsListPdfDocumentType('modern'),
  createAccountStatementPdfDocumentType('legacy'),
  createAccountStatementPdfDocumentType('modern'),
  PaymentAgreementPdfDocumentType,
  createPaymentsReportPdfDocumentType('legacy'),
  createPaymentsReportPdfDocumentType('modern'),
  createConnectionHistoryPdfDocumentType('legacy'),
  createConnectionHistoryPdfDocumentType('modern'),
  createOverdueAccountsPdfDocumentType('legacy'),
  createOverdueAccountsPdfDocumentType('modern'),
];
