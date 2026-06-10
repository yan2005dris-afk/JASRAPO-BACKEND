import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FinalizeMeterLinkUseCase } from './finalize-meter-link.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('FinalizeMeterLinkUseCase', () => {
  let useCase: FinalizeMeterLinkUseCase;

  let mockTx: any;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn(),
  };

  beforeEach(async () => {
    mockTx = {
      medidores: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      historialMedidores: {
        updateMany: jest.fn(),
      },
    };

    mockContractRepository.executeTransaction.mockImplementation((cb: any) =>
      cb(mockTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalizeMeterLinkUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<FinalizeMeterLinkUseCase>(FinalizeMeterLinkUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should finalize link and close history', async () => {
    const medidorId = BigInt(1);
    mockTx.medidores.findUnique.mockResolvedValue({
      medidorId,
    });
    mockTx.historialMedidores.updateMany.mockResolvedValue({
      count: 1,
    });

    const result = await useCase.execute(medidorId);

    expect(result).toBeDefined();

    // Should close existing history for the medidor
    expect(mockTx.historialMedidores.updateMany).toHaveBeenCalledWith({
      where: { medidorId, fechaHasta: null },
      data: { fechaHasta: expect.any(Date) },
    });
  });
});
