import type {
  ProjectedReport,
  ReportDocument,
} from '../models/report-projection';
import {
  AccountStatementReportEmailStrategy,
  buildReportEmailStrategies,
  ClientsListReportEmailStrategy,
  ConnectionHistoryReportEmailStrategy,
  PaymentAgreementReportEmailStrategy,
  PaymentsReportEmailStrategy,
} from './send-report-by-email.strategies';
import { ReportRequestContextFactory } from '../report-request-context.factory';
import type { ReportKey } from '../report-style.service';

const report = {
  document: {
    reporte: {
      titulo: 'Listado de Clientes',
      fecha: '20 de mayo de 2024',
      filtrosAplicados: '',
      totalClientes: 0,
      clientes: [],
    },
    institucion: {} as never,
    metadatosDocumento: {} as never,
  },
  recipientEmail: 'cliente@example.com',
} as ProjectedReport<ReportDocument>;
const contextFactory = new ReportRequestContextFactory();

function context(reportType: ReportKey, filters: object = {}) {
  return contextFactory.create({
    reportType,
    actor: { usersId: 7 },
    filters,
  });
}

function definition() {
  return { generate: jest.fn().mockResolvedValue(report) };
}

describe('report email strategies', () => {
  it.each([
    [PaymentsReportEmailStrategy, 'payments-report'],
    [ConnectionHistoryReportEmailStrategy, 'connection-history'],
    [PaymentAgreementReportEmailStrategy, 'payment-agreement'],
    [AccountStatementReportEmailStrategy, 'account-statement'],
  ])('%p comparte la definición tipada con correo', async (Strategy, key) => {
    const sharedDefinition = definition();
    const strategy = new Strategy(sharedDefinition as never).build();

    const requestContext = context(key as ReportKey, { id: '1' });
    const result = await strategy.fetchReport(requestContext);

    expect(strategy.reportType).toBe(key);
    expect(result).toBe(report);
    expect(strategy.recipientResolver(requestContext, result)).toBe(
      'cliente@example.com',
    );
    expect(sharedDefinition.generate).toHaveBeenCalledTimes(1);
  });

  it('clients-list usa el contexto compartido y requiere destinatario explícito', async () => {
    const sharedDefinition = definition();
    const strategy = new ClientsListReportEmailStrategy(
      sharedDefinition as never,
    ).build();

    const requestContext = context('clients-list', { activo: false });
    const result = await strategy.fetchReport(requestContext);

    expect(sharedDefinition.generate).toHaveBeenCalledWith(requestContext);
    expect(strategy.recipientResolver(requestContext, result)).toBeNull();
    expect(strategy.subjectBuilder(requestContext)).toContain('Inactivos');
  });

  it('construye el mapa completo de estrategias', () => {
    const build = (reportType: string) => ({
      build: jest.fn().mockReturnValue({ reportType }),
    });
    const strategies = buildReportEmailStrategies(
      build('payments-report') as never,
      build('connection-history') as never,
      build('payment-agreement') as never,
      build('account-statement') as never,
      build('clients-list') as never,
      build('overdue-accounts') as never,
    );

    expect(Object.keys(strategies)).toEqual([
      'payments-report',
      'connection-history',
      'payment-agreement',
      'account-statement',
      'clients-list',
      'overdue-accounts',
    ]);
  });
});
