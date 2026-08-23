import type {
  AccountStatementReportFilters,
  AccountStatementReportReadModel,
} from '../read-models/account-statement.read-model';
import type {
  ClientsListReportFilters,
  ClientsListReportReadModel,
} from '../read-models/clients-list.read-model';
import type {
  ConnectionHistoryReportFilters,
  ConnectionHistoryReportReadModel,
} from '../read-models/connection-history.read-model';
import type {
  OverdueAccountsReportFilters,
  OverdueAccountsReportReadModel,
} from '../read-models/overdue-accounts.read-model';
import type {
  PaymentAgreementReportFilters,
  PaymentAgreementReportReadModel,
} from '../read-models/payment-agreement.read-model';
import type {
  PaymentsReportFilters,
  PaymentsReportReadModel,
} from '../read-models/payments-report.read-model';

export interface ReportQueryPort<TFilters, TReadModel> {
  query(filters: TFilters): Promise<TReadModel>;
}

export abstract class ClientsListReportQueryPort implements ReportQueryPort<
  ClientsListReportFilters,
  ClientsListReportReadModel
> {
  abstract query(
    filters: ClientsListReportFilters,
  ): Promise<ClientsListReportReadModel>;
}

export abstract class PaymentsReportQueryPort implements ReportQueryPort<
  PaymentsReportFilters,
  PaymentsReportReadModel
> {
  abstract query(
    filters: PaymentsReportFilters,
  ): Promise<PaymentsReportReadModel>;
}

export abstract class ConnectionHistoryReportQueryPort implements ReportQueryPort<
  ConnectionHistoryReportFilters,
  ConnectionHistoryReportReadModel
> {
  abstract query(
    filters: ConnectionHistoryReportFilters,
  ): Promise<ConnectionHistoryReportReadModel>;
}

export abstract class AccountStatementReportQueryPort implements ReportQueryPort<
  AccountStatementReportFilters,
  AccountStatementReportReadModel
> {
  abstract query(
    filters: AccountStatementReportFilters,
  ): Promise<AccountStatementReportReadModel>;
}

export abstract class OverdueAccountsReportQueryPort implements ReportQueryPort<
  OverdueAccountsReportFilters,
  OverdueAccountsReportReadModel
> {
  abstract query(
    filters: OverdueAccountsReportFilters,
  ): Promise<OverdueAccountsReportReadModel>;
}

export abstract class PaymentAgreementReportQueryPort implements ReportQueryPort<
  PaymentAgreementReportFilters,
  PaymentAgreementReportReadModel
> {
  abstract query(
    filters: PaymentAgreementReportFilters,
  ): Promise<PaymentAgreementReportReadModel>;
}
