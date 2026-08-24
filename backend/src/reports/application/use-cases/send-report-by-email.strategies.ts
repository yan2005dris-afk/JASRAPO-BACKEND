import { Injectable } from '@nestjs/common';
import { AccountStatementReportDefinition } from '../definitions/account-statement-report.definition';
import { ClientsListReportDefinition } from '../definitions/clients-list-report.definition';
import { ConnectionHistoryReportDefinition } from '../definitions/connection-history-report.definition';
import { PaymentAgreementReportDefinition } from '../definitions/payment-agreement-report.definition';
import { PaymentsReportDefinition } from '../definitions/payments-report.definition';
import type {
  ProjectedReport,
  ReportDocument,
} from '../models/report-projection';
import type { ClientsListReportFilters } from '../read-models/clients-list.read-model';
import type { PaymentAgreementReportFilters } from '../read-models/payment-agreement.read-model';
import type { PaymentsReportFilters } from '../read-models/payments-report.read-model';
import type { ConnectionHistoryReportFilters } from '../read-models/connection-history.read-model';
import type { AccountStatementReportFilters } from '../read-models/account-statement.read-model';
import type { ReportKey } from '../report-style.service';

export const REPORT_EMAIL_STRATEGIES = 'REPORT_EMAIL_STRATEGIES';

export interface ReportEmailStrategy {
  readonly reportType: ReportKey;
  fetchReport(filters: unknown): Promise<ProjectedReport<ReportDocument>>;
  recipientResolver(
    filters: unknown,
    report: ProjectedReport<ReportDocument>,
  ): Promise<string | null> | string | null;
  subjectBuilder(filters: unknown): string;
}

@Injectable()
export class PaymentsReportEmailStrategy {
  constructor(private readonly definition: PaymentsReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'payments-report',
      fetchReport: (filters) =>
        this.definition.generate(filters as PaymentsReportFilters),
      recipientResolver: (_filters, report) => report.recipientEmail,
      subjectBuilder: (filters) => {
        const typedFilters = filters as PaymentsReportFilters;
        return `Reporte de Abonos — Cliente #${typedFilters.clienteId ?? '?'}`;
      },
    };
  }
}

@Injectable()
export class ConnectionHistoryReportEmailStrategy {
  constructor(private readonly definition: ConnectionHistoryReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'connection-history',
      fetchReport: (filters) =>
        this.definition.generate(filters as ConnectionHistoryReportFilters),
      recipientResolver: (_filters, report) => report.recipientEmail,
      subjectBuilder: (filters) => {
        const typedFilters = filters as ConnectionHistoryReportFilters;
        return `Historial de Conexión — Contrato #${typedFilters.contratoId ?? '?'}`;
      },
    };
  }
}

@Injectable()
export class PaymentAgreementReportEmailStrategy {
  constructor(private readonly definition: PaymentAgreementReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'payment-agreement',
      fetchReport: (filters) =>
        this.definition.generate(filters as PaymentAgreementReportFilters),
      recipientResolver: (_filters, report) => report.recipientEmail,
      subjectBuilder: (filters) => {
        const typedFilters = filters as PaymentAgreementReportFilters;
        return `Convenio de Pago #${typedFilters.convenioId}`;
      },
    };
  }
}

@Injectable()
export class AccountStatementReportEmailStrategy {
  constructor(private readonly definition: AccountStatementReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'account-statement',
      fetchReport: (filters) =>
        this.definition.generate(filters as AccountStatementReportFilters),
      recipientResolver: (_filters, report) => report.recipientEmail,
      subjectBuilder: (filters) => {
        const typedFilters = filters as AccountStatementReportFilters;
        return `Estado de Cuenta — Contrato #${typedFilters.contratoId ?? '?'}`;
      },
    };
  }
}

@Injectable()
export class ClientsListReportEmailStrategy {
  constructor(private readonly definition: ClientsListReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'clients-list',
      fetchReport: (filters) => {
        const directFilters = filters as ClientsListReportFilters;
        const nestedFilters = filters as {
          filtros?: ClientsListReportFilters;
        };
        return this.definition.generate(nestedFilters.filtros ?? directFilters);
      },
      recipientResolver: () => null,
      subjectBuilder: (filters) => {
        const typedFilters = filters as ClientsListReportFilters;
        return `Listado de Clientes${typedFilters.activo === false ? ' (Inactivos)' : ''}`;
      },
    };
  }
}

export type ReportEmailStrategyMap = Record<ReportKey, ReportEmailStrategy>;

export const buildReportEmailStrategies = (
  payments: PaymentsReportEmailStrategy,
  connectionHistory: ConnectionHistoryReportEmailStrategy,
  paymentAgreement: PaymentAgreementReportEmailStrategy,
  accountStatement: AccountStatementReportEmailStrategy,
  clientsList: ClientsListReportEmailStrategy,
): ReportEmailStrategyMap => ({
  'payments-report': payments.build(),
  'connection-history': connectionHistory.build(),
  'payment-agreement': paymentAgreement.build(),
  'account-statement': accountStatement.build(),
  'clients-list': clientsList.build(),
});

export const REPORT_EMAIL_STRATEGIES_PROVIDER = {
  provide: REPORT_EMAIL_STRATEGIES,
  useFactory: buildReportEmailStrategies,
  inject: [
    PaymentsReportEmailStrategy,
    ConnectionHistoryReportEmailStrategy,
    PaymentAgreementReportEmailStrategy,
    AccountStatementReportEmailStrategy,
    ClientsListReportEmailStrategy,
  ],
};
