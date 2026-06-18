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
import { SendBatchPreInvoicesByEmailUseCase } from './send-batch-pre-invoices-by-email.use-case';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';
import { GeneratePreInvoicePdfUseCase } from './generate-pre-invoice-pdf.use-case';
import { MailService } from 'src/infrastructure/mail/mail.service';

describe('SendBatchPreInvoicesByEmailUseCase', () => {
  let useCase: SendBatchPreInvoicesByEmailUseCase;

  const mockFindOne = { execute: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };
  const mockMailService = { sendBatchPlanillas: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendBatchPreInvoicesByEmailUseCase,
        { provide: FindOnePreInvoiceUseCase, useValue: mockFindOne },
        { provide: GeneratePreInvoicePdfUseCase, useValue: mockGeneratePdf },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    useCase = module.get(SendBatchPreInvoicesByEmailUseCase);
    jest.clearAllMocks();
    mockGeneratePdf.execute.mockResolvedValue(Buffer.from('pdf'));
    mockMailService.sendBatchPlanillas.mockResolvedValue(undefined);
  });

  it('should group processed prefacturas by periodo without re-fetching chunk[0]', async () => {
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

    const result = await useCase.execute([1, 2]);

    expect(mockFindOne.execute).toHaveBeenCalledTimes(2);
    expect(mockMailService.sendBatchPlanillas).toHaveBeenCalledTimes(2);
    expect(mockMailService.sendBatchPlanillas).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          email: 'a@test.com',
          nombre: 'Cliente A',
        }),
      ],
      'Enero 2026',
    );
    expect(mockMailService.sendBatchPlanillas).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          email: 'b@test.com',
          nombre: 'Cliente B',
        }),
      ],
      'Febrero 2026',
    );
    expect(result).toEqual({ queued: 2, skipped: 0, batches: 2 });
  });
});
