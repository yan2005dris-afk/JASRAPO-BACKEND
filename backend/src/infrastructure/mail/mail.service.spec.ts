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

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Decimal } from 'decimal.js';
import { MailService } from './mail.service';
import { MailProviderFactory } from './providers/provider.factory';
import { MailQueueService } from './mail-queue.service';

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
});
