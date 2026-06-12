import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneContractUseCase } from './find-one-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { NotFoundException } from '@nestjs/common';

describe('FindOneContractUseCase', () => {
  let useCase: FindOneContractUseCase;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a contract if it exists and is not deleted', async () => {
    const id = BigInt(1);
    const mockContract = { contratoId: id, deletedAt: null };
    mockContractRepository.findUnique.mockResolvedValue(mockContract);

    const result = await useCase.execute(id);

    expect(mockContractRepository.findUnique).toHaveBeenCalledWith({
      contratoId: id,
    });
  });

  it('should throw NotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockContractRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if contract is deleted', async () => {
    const id = BigInt(1);
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
  });
});
