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
import type {
  ZoneConsumptionReportFilters,
  ZoneConsumptionReportReadModel,
} from '../read-models/zone-consumption.read-model';
import type { ReportRequestContext } from '../models/report-request-context';

export interface ReportQueryPort<TFilters extends object, TReadModel> {
  query(context: ReportRequestContext<TFilters>): Promise<TReadModel>;
}

export abstract class ClientsListReportQueryPort implements ReportQueryPort<
  ClientsListReportFilters,
  ClientsListReportReadModel
> {
  abstract query(
    context: ReportRequestContext<ClientsListReportFilters>,
  ): Promise<ClientsListReportReadModel>;
}

export abstract class PaymentsReportQueryPort implements ReportQueryPort<
  PaymentsReportFilters,
  PaymentsReportReadModel
> {
  abstract query(
    context: ReportRequestContext<PaymentsReportFilters>,
  ): Promise<PaymentsReportReadModel>;
}

export abstract class ConnectionHistoryReportQueryPort implements ReportQueryPort<
  ConnectionHistoryReportFilters,
  ConnectionHistoryReportReadModel
> {
  abstract query(
    context: ReportRequestContext<ConnectionHistoryReportFilters>,
  ): Promise<ConnectionHistoryReportReadModel>;
}

export abstract class AccountStatementReportQueryPort implements ReportQueryPort<
  AccountStatementReportFilters,
  AccountStatementReportReadModel
> {
  abstract query(
    context: ReportRequestContext<AccountStatementReportFilters>,
  ): Promise<AccountStatementReportReadModel>;
}

export abstract class OverdueAccountsReportQueryPort implements ReportQueryPort<
  OverdueAccountsReportFilters,
  OverdueAccountsReportReadModel
> {
  abstract query(
    context: ReportRequestContext<OverdueAccountsReportFilters>,
  ): Promise<OverdueAccountsReportReadModel>;
}

export abstract class PaymentAgreementReportQueryPort implements ReportQueryPort<
  PaymentAgreementReportFilters,
  PaymentAgreementReportReadModel
> {
  abstract query(
    context: ReportRequestContext<PaymentAgreementReportFilters>,
  ): Promise<PaymentAgreementReportReadModel>;
}

export abstract class ZoneConsumptionReportQueryPort implements ReportQueryPort<
  ZoneConsumptionReportFilters,
  ZoneConsumptionReportReadModel
> {
  abstract query(
    context: ReportRequestContext<ZoneConsumptionReportFilters>,
  ): Promise<ZoneConsumptionReportReadModel>;
}
