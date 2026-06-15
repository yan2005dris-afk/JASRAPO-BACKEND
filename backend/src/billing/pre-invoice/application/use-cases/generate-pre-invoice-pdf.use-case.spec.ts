jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GeneratePreInvoicePdfUseCase } from './generate-pre-invoice-pdf.use-case';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';

describe('GeneratePreInvoicePdfUseCase', () => {
  let useCase: GeneratePreInvoicePdfUseCase;

  const mockFindOne = { execute: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratePreInvoicePdfUseCase,
        { provide: FindOnePreInvoiceUseCase, useValue: mockFindOne },
        { provide: GeneratePdfUseCase, useValue: mockGeneratePdf },
      ],
    }).compile();

    useCase = module.get<GeneratePreInvoicePdfUseCase>(
      GeneratePreInvoicePdfUseCase,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call findOne with the given id', async () => {
    const data = { prefacturaId: 7 };
    mockFindOne.execute.mockResolvedValue(data);
    mockGeneratePdf.execute.mockResolvedValue(Buffer.from('pdf'));

    await useCase.execute(7);

    expect(mockFindOne.execute).toHaveBeenCalledWith(7);
  });

  it('should call generatePdf with pre-invoice type and data', async () => {
    const data = { prefacturaId: 7 };
    const pdfBuffer = Buffer.from('pdf');
    mockFindOne.execute.mockResolvedValue(data);
    mockGeneratePdf.execute.mockResolvedValue(pdfBuffer);

    await useCase.execute(7);

    expect(mockGeneratePdf.execute).toHaveBeenCalledWith('pre-invoice', data);
  });

  it('should return the PDF buffer', async () => {
    const pdfBuffer = Buffer.from('pdf-content');
    mockFindOne.execute.mockResolvedValue({ prefacturaId: 1 });
    mockGeneratePdf.execute.mockResolvedValue(pdfBuffer);

    const result = await useCase.execute(1);

    expect(result).toBe(pdfBuffer);
  });

  it('should propagate NotFoundException from findOne', async () => {
    mockFindOne.execute.mockRejectedValue(
      new NotFoundException('Pre-invoice 99 not found'),
    );

    await expect(useCase.execute(99)).rejects.toThrow(NotFoundException);
  });
});
