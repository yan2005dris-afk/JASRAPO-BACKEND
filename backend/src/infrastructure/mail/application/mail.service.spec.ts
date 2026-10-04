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
import { SistemaConfigService } from '../../config/sistema-config.service';
import { FRONTEND_URL } from '../../config/sistema-config.keys';
import { MAIL_TEMPLATES } from '../infrastructure/templates/mail-templates';

describe('MailService', () => {
  let service: MailService;

  const mockProviderFactory = {
    send: jest.fn(),
  };

  const mockQueueService = {
    queueMail: jest.fn(),
    queueBulkMails: jest.fn(),
  };

  const mockSistemaConfigService = {
    getString: jest.fn(),
  };

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailProviderFactory, useValue: mockProviderFactory },
        { provide: MailQueueService, useValue: mockQueueService },
        { provide: SistemaConfigService, useValue: mockSistemaConfigService },
      ],
    }).compile();

    service = module.get(MailService);
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
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
        {},
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

    it('deduplicates delivery retries with the report idempotency key', async () => {
      mockQueueService.queueMail.mockResolvedValue(null);

      const result = await service.sendReport(
        'client@example.com',
        'Reporte',
        'payments-report',
        Buffer.from('pdf-bytes'),
        {
          idempotencyKey: '4b35520c-b4ae-41af-a136-a53ba5a8fd94',
        },
      );

      expect(result).toEqual({
        jobId: 'report-email-delivery:4b35520c-b4ae-41af-a136-a53ba5a8fd94',
      });
      expect(mockQueueService.queueMail).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          singletonKey:
            'report-email-delivery:4b35520c-b4ae-41af-a136-a53ba5a8fd94',
        }),
      );
    });

    it('references a generic-report template defined in MAIL_TEMPLATES', () => {
      // The worker's renderTemplate() uses MAIL_TEMPLATES['generic-report'].
      // Verify the template is properly registered in the typed templates module.
      expect(typeof MAIL_TEMPLATES['generic-report']).toBe('function');
    });
  });

  describe('getFrontendUrl', () => {
    it('returns FRONTEND_URL from sistemaConfigService when configured in DB', async () => {
      mockSistemaConfigService.getString.mockResolvedValue(
        'https://clientes.jasrapo.com',
      );
      process.env.APP_URL = 'https://staging.jasrapo.com';

      const url = await service.getFrontendUrl();

      expect(mockSistemaConfigService.getString).toHaveBeenCalledWith(
        FRONTEND_URL,
      );
      expect(url).toBe('https://clientes.jasrapo.com');
    });

    it('falls back to process.env.APP_URL when DB value is null', async () => {
      mockSistemaConfigService.getString.mockResolvedValue(null);
      process.env.APP_URL = 'https://staging.jasrapo.com';

      const url = await service.getFrontendUrl();

      expect(mockSistemaConfigService.getString).toHaveBeenCalledWith(
        FRONTEND_URL,
      );
      expect(url).toBe('https://staging.jasrapo.com');
    });

    it('falls back to process.env.APP_URL when DB value is empty whitespace', async () => {
      mockSistemaConfigService.getString.mockResolvedValue('   ');
      process.env.APP_URL = 'https://staging.jasrapo.com';

      const url = await service.getFrontendUrl();

      expect(url).toBe('https://staging.jasrapo.com');
    });

    it('falls back to default http://localhost:4200 when both DB and process.env.APP_URL are empty', async () => {
      mockSistemaConfigService.getString.mockResolvedValue(null);
      delete process.env.APP_URL;

      const url = await service.getFrontendUrl();

      expect(url).toBe('http://localhost:4200');
    });
  });

  describe('sendInvitation', () => {
    it('queues invitation email using dynamic frontend url', async () => {
      mockSistemaConfigService.getString.mockResolvedValue(
        'https://app.jasrapo.com',
      );
      mockQueueService.queueMail.mockResolvedValue('job-inv-1');

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const jobId = await service.sendInvitation(
        'nuevo@jasrapo.com',
        'Juan Perez',
        'sample-token-123',
        expiresAt,
      );

      expect(jobId).toBe('job-inv-1');
      expect(mockQueueService.queueMail).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
          to: 'nuevo@jasrapo.com',
          subject: 'Completa tu registro en JASRAPO-Olon',
          template: 'invitation',
          context: expect.objectContaining({
            nombres: 'Juan Perez',
            token: 'sample-token-123',
            acceptUrl:
              'https://app.jasrapo.com/auth/invitations/accept?token=sample-token-123',
            expiresInHours: 24,
          }),
        }),
      );
    });
  });
});
