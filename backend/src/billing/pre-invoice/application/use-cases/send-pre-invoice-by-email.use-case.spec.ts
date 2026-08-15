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
import { BadRequestException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { SendPreInvoiceByEmailUseCase } from './send-pre-invoice-by-email.use-case';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';
import { GeneratePreInvoicePdfUseCase } from './generate-pre-invoice-pdf.use-case';
import { MailService } from 'src/infrastructure/mail/application/mail.service';

describe('SendPreInvoiceByEmailUseCase', () => {
  let useCase: SendPreInvoiceByEmailUseCase;

  const mockFindOne = { execute: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };
  const mockMailService = { sendPlanilla: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendPreInvoiceByEmailUseCase,
        { provide: FindOnePreInvoiceUseCase, useValue: mockFindOne },
        { provide: GeneratePreInvoicePdfUseCase, useValue: mockGeneratePdf },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    useCase = module.get(SendPreInvoiceByEmailUseCase);
    jest.clearAllMocks();
  });

  it('should generate pdf and queue planilla email', async () => {
    const pdfBuffer = Buffer.from('pdf-content');
    mockFindOne.execute.mockResolvedValue({
      prefacturaId: 10,
      clienteEmail: 'cliente@test.com',
      clienteNombre: 'Juan Perez',
      totalPagar: 42.5,
      periodoRel: { nombre: 'Enero 2026' },
    });
    mockGeneratePdf.execute.mockResolvedValue(pdfBuffer);

    const result = await useCase.execute(10);

    expect(mockGeneratePdf.execute).toHaveBeenCalledWith(10);
    expect(mockMailService.sendPlanilla).toHaveBeenCalledWith(
      'cliente@test.com',
      'Juan Perez',
      'Enero 2026',
      42.5,
      pdfBuffer,
    );
    expect(result).toEqual({ email: 'cliente@test.com', queued: true });
  });

  it('should throw when client has no email', async () => {
    mockFindOne.execute.mockResolvedValue({
      prefacturaId: 11,
      clienteEmail: null,
      contrato: { cliente: { email: null } },
    });

    await expect(useCase.execute(11)).rejects.toThrow(BadRequestException);
    expect(mockGeneratePdf.execute).not.toHaveBeenCalled();
  });
});
