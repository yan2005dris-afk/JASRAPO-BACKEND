import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import type { ReportDocument } from '../models/report-projection';
import type { ReportKey } from '../report-style.service';
import type {
  ReportEmailStrategy,
  ReportEmailStrategyMap,
} from './send-report-by-email.strategies';
import { SendReportByEmailUseCase } from './send-report-by-email.use-case';
import { ReportRequestContextFactory } from '../report-request-context.factory';

describe('SendReportByEmailUseCase', () => {
  const reportEmailJobs = { enqueue: jest.fn() };
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };
  const contextFactory = new ReportRequestContextFactory();
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
    const context = contextFactory.create({
      reportType: 'payments-report',
      actor: { usersId: 7 },
      filters: { clienteId: '1' },
    });

    const result = await useCase.execute({
      context,
      idempotencyKey: '4b35520c-b4ae-41af-a136-a53ba5a8fd94',
    });

    expect(result).toEqual(
      expect.objectContaining({
        queued: true,
        jobId: 'job-abc',
        destinatario: 'client@example.com',
        subject: 'Reporte de Abonos - Cliente #1',
        context: expect.objectContaining({
          reportType: 'payments-report',
          actorId: 7,
        }),
      }),
    );
    expect(strategy.fetchReport).toHaveBeenCalledWith(context);
    expect(strategy.recipientResolver).toHaveBeenCalledWith(
      context,
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
    const context = contextFactory.create({
      reportType: 'payments-report',
      actor: { usersId: 7 },
      filters: { clienteId: '1' },
    });

    await useCase.execute({
      context,
      destinatarioOverride: 'override@example.com',
      subjectOverride: 'Custom subject',
    });

    expect(strategy.fetchReport).toHaveBeenCalledWith(context);
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
    const context = {
      ...contextFactory.create({
        reportType: 'payments-report',
        actor: { usersId: 7 },
        filters: {},
      }),
      reportType: 'unknown' as never,
    };

    await expect(useCase.execute({ context })).rejects.toThrow(
      NotFoundException,
    );
    expect(reportEmailJobs.enqueue).not.toHaveBeenCalled();
  });

  it('rejects a missing derived recipient before enqueueing', async () => {
    const strategy = buildStrategy({
      reportType: 'clients-list',
      recipientResolver: jest.fn().mockResolvedValue(null),
    });
    const useCase = buildUseCase({ 'clients-list': strategy });
    const context = contextFactory.create({
      reportType: 'clients-list',
      actor: { usersId: 7 },
      filters: {},
    });

    await expect(useCase.execute({ context })).rejects.toThrow(
      BadRequestException,
    );
    expect(reportEmailJobs.enqueue).not.toHaveBeenCalled();
  });

  it('propagates queue admission errors', async () => {
    reportEmailJobs.enqueue.mockRejectedValue(new Error('pg-boss unavailable'));
    const useCase = buildUseCase({
      'payments-report': buildStrategy(),
    });
    const context = contextFactory.create({
      reportType: 'payments-report',
      actor: { usersId: 7 },
      filters: { clienteId: '1' },
    });

    await expect(useCase.execute({ context })).rejects.toThrow(
      'pg-boss unavailable',
    );
  });

  it('does not place the recipient address in INFO logs', async () => {
    const useCase = buildUseCase({
      'payments-report': buildStrategy({
        recipientResolver: jest.fn().mockResolvedValue('pii@example.com'),
      }),
    });
    const context = contextFactory.create({
      reportType: 'payments-report',
      actor: { usersId: 7 },
      filters: { clienteId: '1' },
    });

    await useCase.execute({ context });

    const infoOutput = logger.log.mock.calls.flat().join(' ');
    expect(infoOutput).not.toContain('pii@example.com');
    expect(infoOutput).toContain('job-abc');
  });

  it('reportRetryReusesNormalizedContext', async () => {
    const strategy = buildStrategy();
    const useCase = buildUseCase({ 'payments-report': strategy });
    const context = contextFactory.create({
      reportType: 'payments-report',
      actor: { usersId: 7 },
      filters: {
        clienteId: '25',
        fechaDesde: '2026-08-01',
        fechaHasta: '2026-08-24',
      },
    });

    await useCase.execute({ context });
    await useCase.execute({ context });

    const fetchReport = strategy.fetchReport as jest.Mock;
    expect(fetchReport).toHaveBeenNthCalledWith(1, context);
    expect(fetchReport).toHaveBeenNthCalledWith(2, context);
  });
});
