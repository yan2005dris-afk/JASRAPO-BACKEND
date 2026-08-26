import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import type { AccountStatementReportDocument } from '../../application/read-models/account-statement.read-model';

export type AccountStatementStyle = 'legacy' | 'modern';

export type AccountStatementPdfViewModel = AccountStatementReportDocument;

export function createAccountStatementPdfDocumentType(
  style: AccountStatementStyle,
): PdfDocumentType<
  AccountStatementReportDocument,
  AccountStatementPdfViewModel
> {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'account-statement-legacy' : 'account-statement-modern',
    name: isLegacy ? 'Estado de Cuenta (Legacy)' : 'Estado de Cuenta (Moderno)',
    template: isLegacy
      ? 'account-statement-legacy'
      : 'account-statement-modern',
    adaptData: (document) => document,
  };
}
