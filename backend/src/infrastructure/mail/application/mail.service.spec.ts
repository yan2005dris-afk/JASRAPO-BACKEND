jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    createQueue: jest.fn(),
    send: jest.fn(),
    insert: jest.fn(),
    work: jest.fn(),
  })),
}));

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { MailService } from './mail.service';
import { MailProviderFactory } from '../infrastructure/providers/provider.factory';
import { MailQueueService } from '../infrastructure/queue/mail-queue.service';

describe('MailService', () => {
  let service: MailService;

  const mockProviderFactory = {
    send: jest.fn(),
  };

  const mockQueueService = {
    queueMail: jest.fn(),
    queueBulkMails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailProviderFactory, useValue: mockProviderFactory },
        { provide: MailQueueService, useValue: mockQueueService },
      ],
    }).compile();

    service = module.get(MailService);
    jest.clearAllMocks();
  });

  it('should send synchronously through provider factory', async () => {
    mockProviderFactory.send.mockResolvedValue({
      success: true,
      messageId: 'msg-1',
    });

    const result = await service.send({
      to: 'a@test.com',
      subject: 'Hola',
      text: 'Mensaje',
    });

    expect(result.success).toBe(true);
    expect(mockProviderFactory.send).toHaveBeenCalled();
  });

  it('should queue a single planilla email', async () => {
    mockQueueService.queueMail.mockResolvedValue('job-planilla-1');

    await service.sendPlanilla(
      'cliente@test.com',
      'Juan Perez',
      'Enero 2026',
      new Decimal('25.50'),
      Buffer.from('pdf'),
    );

    expect(mockQueueService.queueMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'cliente@test.com',
        template: 'planilla',
        context: expect.objectContaining({
          montoTotal: '25.50',
        }),
        attachments: [
          expect.objectContaining({
            contentType: 'application/pdf',
          }),
        ],
      }),
    );
  });

  it('should queue planillas in batches of 25', async () => {
    const clientes = Array.from({ length: 30 }, (_, index) => ({
      email: `cliente${index}@test.com`,
      nombre: `Cliente ${index}`,
      monto: new Decimal('10.00'),
      pdf: Buffer.from(`pdf-${index}`),
    }));

    await service.sendBatchPlanillas(clientes, 'Enero 2026');

    expect(mockQueueService.queueBulkMails).toHaveBeenCalledTimes(2);
    expect(mockQueueService.queueBulkMails.mock.calls[0]?.[0]).toHaveLength(25);
    expect(mockQueueService.queueBulkMails.mock.calls[1]?.[0]).toHaveLength(5);
  });

  it('should not queue anything if array is empty', async () => {
    await service.sendBatchPlanillas([], 'Enero 2026');
    expect(mockQueueService.queueBulkMails).toHaveBeenCalledTimes(0);
  });

  it('should queue exactly 1 batch for 25 elements', async () => {
    const clientes = Array.from({ length: 25 }, (_, index) => ({
      email: `cliente${index}@test.com`,
      nombre: `Cliente ${index}`,
      monto: new Decimal('10.00'),
      pdf: Buffer.from(`pdf-${index}`),
    }));
    await service.sendBatchPlanillas(clientes, 'Enero 2026');
    expect(mockQueueService.queueBulkMails).toHaveBeenCalledTimes(1);
    expect(mockQueueService.queueBulkMails.mock.calls[0]?.[0]).toHaveLength(25);
  });

  it('should queue exactly 2 batches for 26 elements', async () => {
    const clientes = Array.from({ length: 26 }, (_, index) => ({
      email: `cliente${index}@test.com`,
      nombre: `Cliente ${index}`,
      monto: new Decimal('10.00'),
      pdf: Buffer.from(`pdf-${index}`),
    }));
    await service.sendBatchPlanillas(clientes, 'Enero 2026');
    expect(mockQueueService.queueBulkMails).toHaveBeenCalledTimes(2);
    expect(mockQueueService.queueBulkMails.mock.calls[0]?.[0]).toHaveLength(25);
    expect(mockQueueService.queueBulkMails.mock.calls[1]?.[0]).toHaveLength(1);
  });

  it('should queue planilla and throw when pg-boss rejects', async () => {
    mockQueueService.queueMail.mockResolvedValue(null);

    await expect(
      service.sendPlanilla(
        'cliente@test.com',
        'Juan Perez',
        'Enero 2026',
        new Decimal('25.50'),
        Buffer.from('pdf'),
      ),
    ).rejects.toThrow(InternalServerErrorException);
  });

  describe('sendReport', () => {
    it('returns the job id forwarded from queueMail on the happy path', async () => {
      mockQueueService.queueMail.mockResolvedValue('job-123');

      const result = await service.sendReport(
        'client@example.com',
        'Estado de Cuenta',
        'account-statement',
        Buffer.from('pdf'),
      );

      expect(result).toEqual({ jobId: 'job-123' });
    });

    it('enqueues with version 2 and an inline content attachment', async () => {
      mockQueueService.queueMail.mockResolvedValue('job-xyz');

      await service.sendReport(
        'client@example.com',
        'Reporte',
        'payments-report',
        Buffer.from('pdf-bytes'),
      );

      expect(mockQueueService.queueMail).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
          to: 'client@example.com',
          subject: 'Reporte',
          template: 'generic-report',
          context: { reportType: 'payments-report' },
          attachments: [
            expect.objectContaining({
              filename: 'payments-report.pdf',
              contentType: 'application/pdf',
              content: expect.any(Buffer),
            }),
          ],
        }),
      );
      // Guard against accidental legacy shape (no `url`, has `content`).
      const queued = mockQueueService.queueMail.mock.calls[0]?.[0] ?? {};
      expect(queued.attachments?.[0]?.url).toBeUndefined();
      expect(Buffer.isBuffer(queued.attachments?.[0]?.content)).toBe(true);
    });

    it('throws InternalServerErrorException when pg-boss returns null jobId', async () => {
      mockQueueService.queueMail.mockResolvedValue(null);

      await expect(
        service.sendReport(
          'client@example.com',
          'Reporte',
          'payments-report',
          Buffer.from('pdf-bytes'),
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('references a generic-report.hbs template that resolves on disk', () => {
      // The pg-boss worker's renderTemplate() uses readFileSync on
      // `${templateName}.hbs`. PR 1 ships both the template name and the
      // .hbs file together so the worker never crashes with ENOENT.
      const templateDir = join(__dirname, '..', 'infrastructure', 'templates');
      expect(existsSync(join(templateDir, 'generic-report.hbs'))).toBe(true);
    });
  });
});
