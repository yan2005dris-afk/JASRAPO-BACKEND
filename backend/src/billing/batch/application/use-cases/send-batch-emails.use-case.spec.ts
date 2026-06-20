jest.mock('puppeteer', () => ({}));
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
import { SendBatchEmailsUseCase } from './send-batch-emails.use-case';
import { FindOnePreInvoiceUseCase } from '../../../pre-invoice/application/use-cases/find-one-pre-invoice.use-case';
import { GeneratePreInvoicePdfUseCase } from '../../../pre-invoice/application/use-cases/generate-pre-invoice-pdf.use-case';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { PreInvoiceRepository } from '../../../pre-invoice/domain/repositories/pre-invoice.repository';

describe('SendBatchEmailsUseCase', () => {
  let useCase: SendBatchEmailsUseCase;

  const mockFindOne = { execute: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };
  const mockMailService = { sendBatchPlanillas: jest.fn() };
  const mockPreInvoiceRepo = { findIdsByLoteId: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendBatchEmailsUseCase,
        { provide: FindOnePreInvoiceUseCase, useValue: mockFindOne },
        { provide: GeneratePreInvoicePdfUseCase, useValue: mockGeneratePdf },
        { provide: MailService, useValue: mockMailService },
        { provide: PreInvoiceRepository, useValue: mockPreInvoiceRepo },
      ],
    }).compile();

    useCase = module.get(SendBatchEmailsUseCase);
    jest.clearAllMocks();
    mockGeneratePdf.execute.mockResolvedValue(Buffer.from('pdf'));
    mockMailService.sendBatchPlanillas.mockResolvedValue(undefined);
  });

  it('should resolve batchId to prefacturaIds, group by periodo, and send', async () => {
    mockPreInvoiceRepo.findIdsByLoteId.mockResolvedValue([
      { prefacturaId: BigInt(10) },
      { prefacturaId: BigInt(20) },
    ]);
    mockFindOne.execute
      .mockResolvedValueOnce({
        clienteEmail: 'a@test.com',
        clienteNombre: 'Cliente A',
        totalPagar: new Decimal('10.00'),
        periodoRel: { nombre: 'Enero 2026' },
      })
      .mockResolvedValueOnce({
        clienteEmail: 'b@test.com',
        clienteNombre: 'Cliente B',
        totalPagar: new Decimal('20.00'),
        periodoRel: { nombre: 'Febrero 2026' },
      });

    const result = await useCase.execute(5);

    expect(mockPreInvoiceRepo.findIdsByLoteId).toHaveBeenCalledWith(BigInt(5));
    expect(mockFindOne.execute).toHaveBeenCalledTimes(2);
    expect(mockFindOne.execute).toHaveBeenCalledWith(10);
    expect(mockFindOne.execute).toHaveBeenCalledWith(20);
    expect(mockMailService.sendBatchPlanillas).toHaveBeenCalledTimes(2);
    expect(mockMailService.sendBatchPlanillas).toHaveBeenCalledWith(
      [expect.objectContaining({ email: 'a@test.com' })],
      'Enero 2026',
    );
    expect(mockMailService.sendBatchPlanillas).toHaveBeenCalledWith(
      [expect.objectContaining({ email: 'b@test.com' })],
      'Febrero 2026',
    );
    expect(result).toEqual({ queued: 2, skipped: 0, batches: 2 });
  });

  it('should return empty result when batch has no pre-invoices', async () => {
    mockPreInvoiceRepo.findIdsByLoteId.mockResolvedValue([]);

    const result = await useCase.execute(99);

    expect(mockFindOne.execute).not.toHaveBeenCalled();
    expect(result).toEqual({ queued: 0, skipped: 0, batches: 0 });
  });

  it('should skip pre-invoices without email and continue processing', async () => {
    mockPreInvoiceRepo.findIdsByLoteId.mockResolvedValue([
      { prefacturaId: BigInt(1) },
      { prefacturaId: BigInt(2) },
    ]);
    mockFindOne.execute
      .mockResolvedValueOnce({
        clienteEmail: null,
        clienteNombre: 'Sin Email',
        totalPagar: new Decimal('10.00'),
        periodoRel: { nombre: 'Enero' },
      })
      .mockResolvedValueOnce({
        clienteEmail: 'b@test.com',
        clienteNombre: 'Cliente B',
        totalPagar: new Decimal('20.00'),
        periodoRel: { nombre: 'Enero' },
      });

    const result = await useCase.execute(5);

    expect(result).toEqual({ queued: 1, skipped: 1, batches: 1 });
  });
});
