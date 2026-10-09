import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { preInvoiceRow } from '../../__test-utils__/pre-invoice-row.factory';
import { Prisma } from 'src/generated/prisma/client';

describe('FindOnePreInvoiceUseCase', () => {
  let useCase: FindOnePreInvoiceUseCase;

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
        FindOnePreInvoiceUseCase,
        { provide: PreInvoiceRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindOnePreInvoiceUseCase>(FindOnePreInvoiceUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return pre-invoice when found', async () => {
    mockRepository.findById.mockResolvedValue(mockPreInvoice);

    const result = await useCase.execute(1);

    expect(result.prefacturaId).toBe(BigInt(1));
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException when not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });
});
