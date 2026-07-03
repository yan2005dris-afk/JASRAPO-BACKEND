import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PaymentsReportSpec } from '../../specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from '../../specs/connection-history.report-spec';
import { AccountStatementReportSpec } from '../../specs/account-statement.report-spec';
import { ClientsListReportSpec } from '../../specs/clients-list.report-spec';
import { GetPaymentAgreementPdfDataUseCase } from 'src/billing/collections/agreements/application/use-cases/get-payment-agreement-pdf-data.use-case';
import type { PaymentsReportFilterDto } from '../../dto/payments-report-filter.dto';
import type { ConnectionHistoryFilterDto } from '../../dto/connection-history-filter.dto';
import type { AccountStatementFilterDto } from '../../dto/account-statement-filter.dto';
import type { ClientsListReportFilterDto } from '../../dto/clients-list-report-filter.dto';
import type { ReportEmailStrategy } from './send-report-by-email.strategy';

/**
 * Provider token for the resolved map of `ReportEmailStrategy` keyed by
 * `reportType`. Built once at module init via `useFactory` in
 * `reports.module.ts`.
 *
 * Injects are intentional: tests can swap strategies via custom providers.
 */
export const REPORT_EMAIL_STRATEGIES = 'REPORT_EMAIL_STRATEGIES';

/**
 * Extended strategy contract (PR 2). Adds `fetchSpec(filters)` so each
 * strategy owns the data shape the PDF needs (some are existing `ReportSpec`
 * fetcher calls, one is a use case call, one needs nested filter unwrap).
 *
 * Filters are typed as `unknown` at the contract level so the map-of-strategies
 * type stays invariant-safe across the 5 strategies (each strategy's
 * concrete filter DTO differs). Each `build()` casts internally.
 *
 * `account-statement`'s `recipientResolver` takes both filters AND spec data
 * so it can prefer the already-loaded `contrato.cliente.email` from the spec
 * and fall back to a focused Prisma query only when null.
 */
export interface ReportEmailStrategyV2 {
  readonly reportType: string;
  fetchSpec(filters: unknown): Promise<Record<string, unknown>>;
  recipientResolver(
    filters: unknown,
    specData?: Record<string, unknown>,
  ): Promise<string | null> | string | null;
  subjectBuilder(filters: unknown): string;
}

@Injectable()
export class PaymentsReportEmailStrategy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spec: PaymentsReportSpec,
  ) {}

  build(): ReportEmailStrategyV2 {
    return {
      reportType: 'payments-report',
      fetchSpec: (filters) =>
        this.spec.fetchData(filters as PaymentsReportFilterDto),
      recipientResolver: async (filters) => {
        const f = filters as PaymentsReportFilterDto;
        if (!f.clienteId) return null;
        const cliente = await this.prisma.clientes.findUnique({
          where: { clienteId: BigInt(f.clienteId) },
          select: { email: true },
        });
        return cliente?.email ?? null;
      },
      subjectBuilder: (filters) => {
        const f = filters as PaymentsReportFilterDto;
        return `Reporte de Abonos — Cliente #${f.clienteId ?? '?'}`;
      },
    };
  }
}

@Injectable()
export class ConnectionHistoryReportEmailStrategy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spec: ConnectionHistoryReportSpec,
  ) {}

  build(): ReportEmailStrategyV2 {
    return {
      reportType: 'connection-history',
      fetchSpec: (filters) =>
        this.spec.fetchData(filters as ConnectionHistoryFilterDto),
      recipientResolver: async (filters) => {
        const f = filters as ConnectionHistoryFilterDto;
        if (!f.contratoId) return null;
        const contrato = await this.prisma.contratos.findUnique({
          where: { contratoId: BigInt(f.contratoId) },
          select: { cliente: { select: { email: true } } },
        });
        return contrato?.cliente?.email ?? null;
      },
      subjectBuilder: (filters) => {
        const f = filters as ConnectionHistoryFilterDto;
        return `Historial de Conexión — Contrato #${f.contratoId ?? '?'}`;
      },
    };
  }
}

@Injectable()
export class PaymentAgreementReportEmailStrategy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getPdfData: GetPaymentAgreementPdfDataUseCase,
  ) {}

  build(): ReportEmailStrategyV2 {
    return {
      reportType: 'payment-agreement',
      fetchSpec: (filters) => {
        const f = filters as { convenioId: string };
        return this.getPdfData
          .execute(BigInt(f.convenioId))
          .then((data) => data as unknown as Record<string, unknown>);
      },
      recipientResolver: async (filters) => {
        const f = filters as { convenioId: string };
        if (!f.convenioId) return null;
        const convenio = await this.prisma.convenios.findUnique({
          where: { convenioId: BigInt(f.convenioId) },
          select: {
            contrato: { select: { cliente: { select: { email: true } } } },
          },
        });
        return convenio?.contrato?.cliente?.email ?? null;
      },
      subjectBuilder: (filters) => {
        const f = filters as { convenioId: string };
        return `Convenio de Pago #${f.convenioId}`;
      },
    };
  }
}

@Injectable()
export class AccountStatementReportEmailStrategy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spec: AccountStatementReportSpec,
  ) {}

  build(): ReportEmailStrategyV2 {
    return {
      reportType: 'account-statement',
      fetchSpec: (filters) =>
        this.spec.fetchData(filters as AccountStatementFilterDto),
      recipientResolver: async (filters, specData) => {
        // Prefer the email already on the loaded contrato; only hit Prisma
        // when the spec didn't pull it (account-statement spec uses
        // `include: { cliente: true }` so email is usually present).
        const fromSpec = specData?.['contrato'] as
          | { cliente?: { email?: string | null } }
          | undefined;
        const specEmail = fromSpec?.cliente?.email;
        if (specEmail) return specEmail;

        const f = filters as AccountStatementFilterDto;
        if (!f.contratoId) return null;
        const contrato = await this.prisma.contratos.findUnique({
          where: { contratoId: BigInt(f.contratoId) },
          select: { cliente: { select: { email: true } } },
        });
        return contrato?.cliente?.email ?? null;
      },
      subjectBuilder: (filters) => {
        const f = filters as AccountStatementFilterDto;
        return `Estado de Cuenta — Contrato #${f.contratoId ?? '?'}`;
      },
    };
  }
}

@Injectable()
export class ClientsListReportEmailStrategy {
  constructor(private readonly spec: ClientsListReportSpec) {}

  build(): ReportEmailStrategyV2 {
    return {
      reportType: 'clients-list',
      fetchSpec: (filters) => {
        // The controller may pass either `{ filtros: DTO }` or the DTO directly.
        // Unwrap when the nested shape is present so the spec always sees a
        // `ClientsListReportFilterDto`.
        const filtros = (filters as { filtros?: ClientsListReportFilterDto })
          .filtros;
        return this.spec.fetchData(
          (filtros ?? filters) as ClientsListReportFilterDto,
        );
      },
      recipientResolver: () => null,
      subjectBuilder: (filters) => {
        const f = filters as ClientsListReportFilterDto;
        return `Listado de Clientes${f.activo === false ? ' (Inactivos)' : ''}`;
      },
    };
  }
}

/**
 * Build the resolved strategy map at module init. Each entry's `build()` is
 * called once, producing the final `ReportEmailStrategyV2` map the use case
 * consumes. The map shape matches the `reportType` keys the use case looks up.
 */
export const buildReportEmailStrategies = (
  payments: PaymentsReportEmailStrategy,
  connectionHistory: ConnectionHistoryReportEmailStrategy,
  paymentAgreement: PaymentAgreementReportEmailStrategy,
  accountStatement: AccountStatementReportEmailStrategy,
  clientsList: ClientsListReportEmailStrategy,
): Record<string, ReportEmailStrategyV2> => ({
  'payments-report': payments.build(),
  'connection-history': connectionHistory.build(),
  'payment-agreement': paymentAgreement.build(),
  'account-statement': accountStatement.build(),
  'clients-list': clientsList.build(),
});

// Type alias kept for downstream use cases / tests that still import the
// original name.
export type ReportEmailStrategyMap = Record<string, ReportEmailStrategyV2>;

/**
 * Re-export the original strategy interface from the contract file so
 * downstream imports don't need to change. The V2 interface adds
 * `fetchSpec`; consumers using only `recipientResolver`/`subjectBuilder`
 * still see a compatible shape via duck-typing.
 */
export type { ReportEmailStrategy };

/**
 * Convenience hook used by `reports.module.ts` to expose the strategies as
 * an `@Inject(REPORT_EMAIL_STRATEGIES)` token. Mirrors the existing PR 1
 * pattern (strategies passed via the 3rd constructor arg).
 */
export const REPORT_EMAIL_STRATEGIES_PROVIDER = {
  provide: REPORT_EMAIL_STRATEGIES,
  useFactory: (
    payments: PaymentsReportEmailStrategy,
    connectionHistory: ConnectionHistoryReportEmailStrategy,
    paymentAgreement: PaymentAgreementReportEmailStrategy,
    accountStatement: AccountStatementReportEmailStrategy,
    clientsList: ClientsListReportEmailStrategy,
  ): ReportEmailStrategyMap =>
    buildReportEmailStrategies(
      payments,
      connectionHistory,
      paymentAgreement,
      accountStatement,
      clientsList,
    ),
  inject: [
    PaymentsReportEmailStrategy,
    ConnectionHistoryReportEmailStrategy,
    PaymentAgreementReportEmailStrategy,
    AccountStatementReportEmailStrategy,
    ClientsListReportEmailStrategy,
  ],
};

// Hint to avoid an unused import warning when no consumer references
// `@Inject(REPORT_EMAIL_STRATEGIES)` directly outside this file.
void Inject;
