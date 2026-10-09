import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllPreInvoicesUseCase } from './find-all-pre-invoices.use-case';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { BadRequestException } from '@nestjs/common';
import { preInvoiceRow } from '../../__test-utils__/pre-invoice-row.factory';
import { Prisma } from 'src/generated/prisma/client';

describe('FindAllPreInvoicesUseCase', () => {
  let useCase: FindAllPreInvoicesUseCase;

  const mockPreInvoice = preInvoiceRow({
    prefacturaId: 1n,
    uuid: 'uuid-1',
    contratoId: 1n,
    periodoId: 1,
    puntoEmisionId: 1,
    subtotal: new Prisma.Decimal(10),
    iva: new Prisma.Decimal(1.2),
    descuentoTotal: new Prisma.Decimal(0),
    totalPagar: new Prisma.Decimal(11.2),
    deudaAnterior: new Prisma.Decimal(0),
    saldoVencido: new Prisma.Decimal(0),
    abono: new Prisma.Decimal(0),
    saldoActual: new Prisma.Decimal(11.2),
    meses_atrasado: 0,
    estado: 'GENERADA',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const mockRepository = {
    paginate: jest.fn(),
    findById: jest.fn(),
    findIdsByLoteId: jest.fn(),
    updateState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllPreInvoicesUseCase,
        { provide: PreInvoiceRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(FindAllPreInvoicesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated pre-invoices', async () => {
    mockRepository.paginate.mockResolvedValue({
      data: [mockPreInvoice],
      meta: { total: 1, page: 1, limit: 10 },
    });

    const result = await useCase.execute(1, 10, { estado: 'GENERADA' });

    expect(result.data).toHaveLength(1);
    expect(mockRepository.paginate).toHaveBeenCalledWith(
      { estado: 'GENERADA' },
      { page: 1, limit: 10 },
    );
  });

  it('should throw BadRequestException if contratoId is not numeric', async () => {
    await expect(
      useCase.execute(1, 10, { contratoId: 'invalid-id' }),
    ).rejects.toThrow(BadRequestException);
  });
});
