import { Injectable } from '@nestjs/common';
import { AccountStatementReportDefinition } from '../definitions/account-statement-report.definition';
import { ClientsListReportDefinition } from '../definitions/clients-list-report.definition';
import { ConnectionHistoryReportDefinition } from '../definitions/connection-history-report.definition';
import { OverdueAccountsReportDefinition } from '../definitions/overdue-accounts-report.definition';
import { PaymentAgreementReportDefinition } from '../definitions/payment-agreement-report.definition';
import { PaymentsReportDefinition } from '../definitions/payments-report.definition';
import { ZoneConsumptionReportDefinition } from '../definitions/zone-consumption-report.definition';
import type {
  ProjectedReport,
  ReportDocument,
} from '../models/report-projection';
import type { ClientsListReportFilters } from '../read-models/clients-list.read-model';
import type { PaymentAgreementReportFilters } from '../read-models/payment-agreement.read-model';
import type { PaymentsReportFilters } from '../read-models/payments-report.read-model';
import type { ConnectionHistoryReportFilters } from '../read-models/connection-history.read-model';
import type { AccountStatementReportFilters } from '../read-models/account-statement.read-model';
import type { OverdueAccountsReportFilters } from '../read-models/overdue-accounts.read-model';
import type { ZoneConsumptionReportFilters } from '../read-models/zone-consumption.read-model';
import type { ReportKey } from '../report-style.service';
import type { ReportRequestContext } from '../models/report-request-context';

export const REPORT_EMAIL_STRATEGIES = 'REPORT_EMAIL_STRATEGIES';

export interface ReportEmailStrategy {
  readonly reportType: ReportKey;
  fetchReport(
    context: ReportRequestContext,
  ): Promise<ProjectedReport<ReportDocument>>;
  recipientResolver(
    context: ReportRequestContext,
    report: ProjectedReport<ReportDocument>,
  ): Promise<string | null> | string | null;
  subjectBuilder(context: ReportRequestContext): string;
}

@Injectable()
export class PaymentsReportEmailStrategy {
  constructor(private readonly definition: PaymentsReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'payments-report',
      fetchReport: (context) => this.definition.generate(context),
      recipientResolver: (_context, report) => report.recipientEmail,
      subjectBuilder: (context) => {
        const typedFilters = context.filters as PaymentsReportFilters;
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
      fetchReport: (context) =>
        this.definition.generate(
          context as ReportRequestContext<ConnectionHistoryReportFilters>,
        ),
      recipientResolver: (_context, report) => report.recipientEmail,
      subjectBuilder: (context) => {
        const typedFilters = context.filters as ConnectionHistoryReportFilters;
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
      fetchReport: (context) =>
        this.definition.generate(
          context as ReportRequestContext<PaymentAgreementReportFilters>,
        ),
      recipientResolver: (_context, report) => report.recipientEmail,
      subjectBuilder: (context) => {
        const typedFilters = context.filters as PaymentAgreementReportFilters;
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
      fetchReport: (context) =>
        this.definition.generate(
          context as ReportRequestContext<AccountStatementReportFilters>,
        ),
      recipientResolver: (_context, report) => report.recipientEmail,
      subjectBuilder: (context) => {
        const typedFilters = context.filters as AccountStatementReportFilters;
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
      fetchReport: (context) => this.definition.generate(context),
      recipientResolver: () => null,
      subjectBuilder: (context) => {
        const typedFilters = context.filters as ClientsListReportFilters;
        return `Listado de Clientes${typedFilters.activo === false ? ' (Inactivos)' : ''}`;
      },
    };
  }
}

@Injectable()
export class OverdueAccountsReportEmailStrategy {
  constructor(private readonly definition: OverdueAccountsReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'overdue-accounts',
      fetchReport: (context) => this.definition.generate(context),
      // Reporte administrativo: no deriva destinatario, requiere override explícito.
      recipientResolver: () => null,
      subjectBuilder: (context) => {
        const typedFilters = context.filters as OverdueAccountsReportFilters;
        return `Recaudación y Morosidad${typedFilters.clienteId ? ` — Cliente #${typedFilters.clienteId}` : ''}`;
      },
    };
  }
}

@Injectable()
export class ZoneConsumptionReportEmailStrategy {
  constructor(private readonly definition: ZoneConsumptionReportDefinition) {}

  build(): ReportEmailStrategy {
    return {
      reportType: 'zone-consumption',
      fetchReport: (context) => this.definition.generate(context),
      // Reporte administrativo: no deriva destinatario, requiere override explícito.
      recipientResolver: () => null,
      subjectBuilder: (context) => {
        const typedFilters = context.filters as ZoneConsumptionReportFilters;
        return `Consumo por Zonas${typedFilters.periodoId ? ` — Periodo #${typedFilters.periodoId}` : ''}`;
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
  overdueAccounts: OverdueAccountsReportEmailStrategy,
  zoneConsumption: ZoneConsumptionReportEmailStrategy,
): ReportEmailStrategyMap => ({
  'payments-report': payments.build(),
  'connection-history': connectionHistory.build(),
  'payment-agreement': paymentAgreement.build(),
  'account-statement': accountStatement.build(),
  'clients-list': clientsList.build(),
  'overdue-accounts': overdueAccounts.build(),
  'zone-consumption': zoneConsumption.build(),
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
    OverdueAccountsReportEmailStrategy,
    ZoneConsumptionReportEmailStrategy,
  ],
};
