import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllPreInvoicesUseCase } from './find-all-pre-invoices.use-case';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';
import { BadRequestException } from '@nestjs/common';

describe('FindAllPreInvoicesUseCase', () => {
  let useCase: FindAllPreInvoicesUseCase;

  const mockPreInvoice = new PreInvoiceEntity({
    prefacturaId: BigInt(1),
    uuid: 'uuid-1',
    contratoId: BigInt(1),
    periodoId: 1,
    puntoEmisionId: 1,
    subtotal: 10,
    iva: 1.2,
    descuentoTotal: 0,
    totalPagar: 11.2,
    deudaAnterior: 0,
    saldoVencido: 0,
    abono: 0,
    saldoActual: 11.2,
    mesesAtrasado: 0,
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
