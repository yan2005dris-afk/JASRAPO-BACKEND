import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import type { ReportDocument } from '../models/report-projection';
import type { ReportKey } from '../report-style.service';
import type {
  ReportEmailStrategy,
  ReportEmailStrategyMap,
} from './send-report-by-email.strategies';
import { SendReportByEmailUseCase } from './send-report-by-email.use-case';

describe('SendReportByEmailUseCase', () => {
  const reportEmailJobs = { enqueue: jest.fn() };
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };
  const document: ReportDocument = {
    reporte: {
      titulo: 'Listado de Clientes',
      fecha: '',
      filtrosAplicados: '',
      totalClientes: 0,
      clientes: [],
    },
  };

  const buildStrategy = (
    overrides: Partial<ReportEmailStrategy> = {},
  ): ReportEmailStrategy => ({
    reportType: 'payments-report',
    fetchReport: jest.fn().mockResolvedValue({
      document,
      recipientEmail: 'client@example.com',
    }),
    recipientResolver: jest.fn().mockResolvedValue('client@example.com'),
    subjectBuilder: jest.fn().mockReturnValue('Reporte de Abonos - Cliente #1'),
    ...overrides,
  });

  const buildUseCase = (
    strategies: Partial<Record<ReportKey, ReportEmailStrategy>>,
  ) =>
    new SendReportByEmailUseCase(
      reportEmailJobs,
      strategies as ReportEmailStrategyMap,
      logger as unknown as LoggerService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    reportEmailJobs.enqueue.mockResolvedValue({
      jobId: 'job-abc',
      deduplicated: false,
    });
  });

  it('queues the exact projected document and returns the accepted job', async () => {
    const strategy = buildStrategy();
    const useCase = buildUseCase({ 'payments-report': strategy });

    const result = await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
      idempotencyKey: '4b35520c-b4ae-41af-a136-a53ba5a8fd94',
    });

    expect(result).toEqual({
      queued: true,
      jobId: 'job-abc',
      destinatario: 'client@example.com',
      subject: 'Reporte de Abonos - Cliente #1',
    });
    expect(strategy.fetchReport).toHaveBeenCalledTimes(1);
    expect(strategy.recipientResolver).toHaveBeenCalledWith(
      { clienteId: '1' },
      expect.objectContaining({ document }),
    );
    expect(reportEmailJobs.enqueue).toHaveBeenCalledWith({
      reportType: 'payments-report',
      document,
      destinatario: 'client@example.com',
      subject: 'Reporte de Abonos - Cliente #1',
      idempotencyKey: '4b35520c-b4ae-41af-a136-a53ba5a8fd94',
    });
  });

  it('skips recipient lookup when an override is supplied', async () => {
    const strategy = buildStrategy();
    const useCase = buildUseCase({ 'payments-report': strategy });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
      destinatarioOverride: 'override@example.com',
      subjectOverride: 'Custom subject',
    });

    expect(strategy.fetchReport).toHaveBeenCalledTimes(1);
    expect(strategy.recipientResolver).not.toHaveBeenCalled();
    expect(reportEmailJobs.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        document,
        destinatario: 'override@example.com',
        subject: 'Custom subject',
      }),
    );
  });

  it('rejects an unsupported report before projecting or enqueueing', async () => {
    const useCase = buildUseCase({});

    await expect(
      useCase.execute({ reportType: 'unknown', filters: {} }),
    ).rejects.toThrow(NotFoundException);
    expect(reportEmailJobs.enqueue).not.toHaveBeenCalled();
  });

  it('rejects a missing derived recipient before enqueueing', async () => {
    const strategy = buildStrategy({
      reportType: 'clients-list',
      recipientResolver: jest.fn().mockResolvedValue(null),
    });
    const useCase = buildUseCase({ 'clients-list': strategy });

    await expect(
      useCase.execute({ reportType: 'clients-list', filters: {} }),
    ).rejects.toThrow(BadRequestException);
    expect(reportEmailJobs.enqueue).not.toHaveBeenCalled();
  });

  it('propagates queue admission errors', async () => {
    reportEmailJobs.enqueue.mockRejectedValue(new Error('pg-boss unavailable'));
    const useCase = buildUseCase({
      'payments-report': buildStrategy(),
    });

    await expect(
      useCase.execute({
        reportType: 'payments-report',
        filters: { clienteId: '1' },
      }),
    ).rejects.toThrow('pg-boss unavailable');
  });

  it('does not place the recipient address in INFO logs', async () => {
    const useCase = buildUseCase({
      'payments-report': buildStrategy({
        recipientResolver: jest.fn().mockResolvedValue('pii@example.com'),
      }),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
    });

    const infoOutput = logger.log.mock.calls.flat().join(' ');
    expect(infoOutput).not.toContain('pii@example.com');
    expect(infoOutput).toContain('job-abc');
  });
});
