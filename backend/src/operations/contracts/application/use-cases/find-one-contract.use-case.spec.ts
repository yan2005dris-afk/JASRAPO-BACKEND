import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneContractUseCase } from './find-one-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { contractRow } from '../../__test-utils__/contract-row.factory';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOneContractUseCase', () => {
  let useCase: FindOneContractUseCase;

  const mockContractRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneContractUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindOneContractUseCase>(FindOneContractUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a contract if it exists', async () => {
    const id = BigInt(1);
    const mockContract = contractRow({
      contratoId: id,
      deletedAt: null,
    });
    mockContractRepository.findById.mockResolvedValue(mockContract);

    const result = await useCase.execute(id);

    expect(mockContractRepository.findById).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockContract);
  });

  it('should throw EntityNotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockContractRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(EntityNotFoundException);
  });
});
