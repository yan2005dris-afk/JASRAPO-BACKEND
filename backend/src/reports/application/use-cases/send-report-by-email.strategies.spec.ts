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

const report: ProjectedReport<ReportDocument> = {
  document: {
    reporte: {
      titulo: 'Listado de Clientes',
      fecha: '20 de mayo de 2024',
      filtrosAplicados: '',
      totalClientes: 0,
      clientes: [],
    },
  },
  recipientEmail: 'cliente@example.com',
};

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

    const result = await strategy.fetchReport({ id: '1' });

    expect(strategy.reportType).toBe(key);
    expect(result).toBe(report);
    expect(strategy.recipientResolver({}, result)).toBe('cliente@example.com');
    expect(sharedDefinition.generate).toHaveBeenCalledTimes(1);
  });

  it('clients-list extrae filtros anidados y requiere destinatario explícito', async () => {
    const sharedDefinition = definition();
    const strategy = new ClientsListReportEmailStrategy(
      sharedDefinition as never,
    ).build();

    const result = await strategy.fetchReport({ filtros: { activo: false } });

    expect(sharedDefinition.generate).toHaveBeenCalledWith({ activo: false });
    expect(strategy.recipientResolver({}, result)).toBeNull();
    expect(strategy.subjectBuilder({ activo: false })).toContain('Inactivos');
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
    );

    expect(Object.keys(strategies)).toEqual([
      'payments-report',
      'connection-history',
      'payment-agreement',
      'account-statement',
      'clients-list',
    ]);
  });
});
