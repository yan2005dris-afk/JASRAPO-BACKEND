import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllContractsUseCase } from './find-all-contracts.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('FindAllContractsUseCase', () => {
  let useCase: FindAllContractsUseCase;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllContractsUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllContractsUseCase>(FindAllContractsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call findMany with correct parameters', async () => {
    mockContractRepository.findMany.mockResolvedValue([]);
    mockContractRepository.count.mockResolvedValue(0);

    const result = await useCase.execute(1, 10);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(mockContractRepository.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockContractRepository.count).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
  });
});
