import type { AccountStatementReportDocument } from '../read-models/account-statement.read-model';
import type { ClientsListReportDocument } from '../read-models/clients-list.read-model';
import type { ConnectionHistoryReportDocument } from '../read-models/connection-history.read-model';
import type { OverdueAccountsReportDocument } from '../read-models/overdue-accounts.read-model';
import type { PaymentAgreementReportDocument } from '../read-models/payment-agreement.read-model';
import type { PaymentsReportDocument } from '../read-models/payments-report.read-model';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';

export interface ProjectedReport<TDocument extends object> {
  document: TDocument;
  recipientEmail: string | null;
}

export type ReportContentDocument =
  | AccountStatementReportDocument
  | ClientsListReportDocument
  | ConnectionHistoryReportDocument
  | OverdueAccountsReportDocument
  | PaymentAgreementReportDocument
  | PaymentsReportDocument;

export type ReportDocument = OfficialDocument<ReportContentDocument>;
