jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    createQueue: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue('job-id'),
    insert: jest.fn().mockResolvedValue(['job-id']),
    work: jest.fn().mockResolvedValue(undefined),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuditService, AUDIT_RETRY_JOB } from './audit.service';
import { PrismaService } from '../database/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { LoggerService } from '../observability/logger/logger.service';

describe('AuditService (#147 durability)', () => {
  let service: AuditService;
  let prisma: { auditoriaSri: { create: jest.Mock } };
  let jobsService: {
    send: jest.Mock;
    work: jest.Mock;
  };
  let loggerService: { error: jest.Mock };

  const sampleEntry = {
    accion: 'CREATE',
    recurso: 'usuarios',
    recursoId: '42',
    exitoso: true,
  };

  beforeEach(async () => {
    prisma = {
      auditoriaSri: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    jobsService = {
      send: jest.fn().mockResolvedValue('job-id'),
      work: jest.fn().mockResolvedValue(undefined),
    };
    loggerService = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
        { provide: JobsService, useValue: jobsService },
        { provide: LoggerService, useValue: loggerService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    await service.onModuleInit();
  });

  it('registers the audit-write worker on init', () => {
    expect(jobsService.work).toHaveBeenCalledWith(
      AUDIT_RETRY_JOB,
      expect.any(Function),
    );
  });

  describe('log()', () => {
    it('writes the entry on success without enqueueing a retry job', async () => {
      await service.log(sampleEntry);

      expect(prisma.auditoriaSri.create).toHaveBeenCalledTimes(1);
      expect(prisma.auditoriaSri.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accion: 'CREATE',
          recurso: 'usuarios',
          recursoId: '42',
          exitoso: true,
        }),
      });
      expect(jobsService.send).not.toHaveBeenCalled();
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('enqueues a retry job when the write fails (case of #147)', async () => {
      const dbError = new Error('connection terminated');
      prisma.auditoriaSri.create.mockRejectedValueOnce(dbError);

      await expect(service.log(sampleEntry)).resolves.toBeUndefined();

      expect(jobsService.send).toHaveBeenCalledTimes(1);
      expect(jobsService.send).toHaveBeenCalledWith(
        AUDIT_RETRY_JOB,
        sampleEntry,
        {
          retryLimit: 5,
          retryDelay: 30,
          retryBackoff: true,
        },
      );
    });

    it('does not throw even when both the DB write and the enqueue fail', async () => {
      prisma.auditoriaSri.create.mockRejectedValueOnce(
        new Error('connection terminated'),
      );
      jobsService.send.mockRejectedValueOnce(new Error('pg-boss down'));

      await expect(service.log(sampleEntry)).resolves.toBeUndefined();
    });
  });

  describe('audit-write worker', () => {
    type WorkHandler = (jobs: any[]) => Promise<void>;
    let handler: WorkHandler;

    beforeEach(() => {
      handler = jobsService.work.mock.calls[0][1] as WorkHandler;
    });

    it('writes successfully when the DB recovers on retry', async () => {
      await handler([
        { id: 'job-1', data: sampleEntry, retryCount: 0, retryLimit: 5 },
      ]);

      expect(prisma.auditoriaSri.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ accion: 'CREATE' }),
      });
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('emits audit.durability.exhausted on the final failed attempt', async () => {
      prisma.auditoriaSri.create.mockRejectedValueOnce(new Error('still down'));

      await expect(
        handler([
          {
            id: 'job-1',
            data: sampleEntry,
            retryCount: 5,
            retryLimit: 5,
          },
        ]),
      ).rejects.toThrow('still down');

      expect(loggerService.error).toHaveBeenCalledTimes(1);
      const [message, trace, context] = loggerService.error.mock.calls[0];
      expect(message).toContain('audit.durability.exhausted');
      expect(message).toContain('action=CREATE');
      expect(trace).toContain('still down');
      expect(context).toBe('AuditService');
    });

    it('does not emit the exhausted event when more retries remain', async () => {
      prisma.auditoriaSri.create.mockRejectedValueOnce(
        new Error('temporary blip'),
      );

      await expect(
        handler([
          {
            id: 'job-1',
            data: sampleEntry,
            retryCount: 1,
            retryLimit: 5,
          },
        ]),
      ).rejects.toThrow('temporary blip');

      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('no-ops on empty job batches', async () => {
      await handler([]);
      expect(prisma.auditoriaSri.create).not.toHaveBeenCalled();
    });
  });
});
