import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOnePreInvoiceUseCase', () => {
  let useCase: FindOnePreInvoiceUseCase;

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
