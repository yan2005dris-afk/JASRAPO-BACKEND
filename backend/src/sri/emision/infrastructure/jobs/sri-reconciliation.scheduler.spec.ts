jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    createQueue: jest.fn().mockResolvedValue(undefined),
    schedule: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue('job-id'),
    insert: jest.fn().mockResolvedValue(['job-id']),
    work: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { SriReconciliationScheduler, SRI_RECONCILIATION_JOB } from './sri-reconciliation.scheduler';
import { JobsService } from '../../../../infrastructure/jobs/jobs.service';
import { SriService } from '../../application/services/sri.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../../infrastructure/observability/logger/logger.service';

describe('SriReconciliationScheduler', () => {
  let scheduler: SriReconciliationScheduler;
  let jobsService: jest.Mocked<JobsService>;
  let sriService: jest.Mocked<SriService>;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    jobsService = {
      schedule: jest.fn().mockResolvedValue('job-schedule-id'),
      work: jest.fn().mockImplementation(async (_name, handler) => {
        return undefined;
      }),
    } as unknown as jest.Mocked<JobsService>;

    sriService = {
      sincronizarConSri: jest.fn().mockResolvedValue({
        procesados: 5,
        actualizados: 3,
        reintentados: 2,
        errores: 0,
      }),
    } as unknown as jest.Mocked<SriService>;

    configService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'SRI_RECONCILIATION_INTERVAL_MINUTES') return 15;
        if (key === 'SRI_RECONCILIATION_STALE_MINUTES') return 15;
        if (key === 'SRI_RECONCILIATION_REINTENTAR') return 'true';
        return defaultValue;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    scheduler = new SriReconciliationScheduler(
      jobsService,
      sriService,
      configService,
      logger,
    );
  });

  describe('onModuleInit', () => {
    it('schedules the reconciliation job with cron expression and registers worker', async () => {
      await scheduler.onModuleInit();

      expect(jobsService.schedule).toHaveBeenCalledWith(
        SRI_RECONCILIATION_JOB,
        '*/15 * * * *',
        {},
      );
      expect(jobsService.work).toHaveBeenCalledWith(
        SRI_RECONCILIATION_JOB,
        expect.any(Function),
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Reconciliación automática con SRI programada cada 15 min'),
      );
    });

    it('uses custom interval minutes from config', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'SRI_RECONCILIATION_INTERVAL_MINUTES') return 30;
        return defaultValue;
      });

      await scheduler.onModuleInit();

      expect(jobsService.schedule).toHaveBeenCalledWith(
        SRI_RECONCILIATION_JOB,
        '*/30 * * * *',
        {},
      );
    });

    it('handles worker execution when job is passed', async () => {
      let workerHandler: Function | null = null;
      jobsService.work.mockImplementation(async (_name, handler: any) => {
        workerHandler = handler;
        return undefined as any;
      });

      await scheduler.onModuleInit();

      const reconciliarSpy = jest.spyOn(scheduler, 'reconciliar').mockResolvedValue();

      if (workerHandler) {
        await workerHandler([{ id: 'job-1' }]);
      }

      expect(reconciliarSpy).toHaveBeenCalled();
    });
  });

  describe('reconciliar', () => {
    it('calls sriService.sincronizarConSri with expected parameters', async () => {
      const now = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(now);

      await scheduler.reconciliar();

      const expectedFechaHasta = new Date(now - 15 * 60 * 1000).toISOString();

      expect(sriService.sincronizarConSri).toHaveBeenCalledWith({
        estados: ['PENDIENTE', 'EN_PROCESO', 'DEVUELTA'],
        fechaHasta: expectedFechaHasta,
        reintentar: true,
      });

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Reconciliación automática con SRI completada: 5 procesados'),
      );
    });

    it('handles errors gracefully without throwing', async () => {
      sriService.sincronizarConSri.mockRejectedValue(new Error('SRI service offline'));

      await expect(scheduler.reconciliar()).resolves.not.toThrow();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Error en reconciliación automática con SRI: SRI service offline'),
      );
    });
  });
});
