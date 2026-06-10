import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateContractUseCase } from './update-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { NotFoundException } from '@nestjs/common';

describe('UpdateContractUseCase', () => {
  let useCase: UpdateContractUseCase;

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
        UpdateContractUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateContractUseCase>(UpdateContractUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a contract if it exists', async () => {
    const id = BigInt(1);
    const updateDto = { motivoCambio: 'NEW-MOTIVO' };
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: null,
    });
    mockContractRepository.update.mockResolvedValue({
      contratoId: id,
      ...updateDto,
    });

    const result = await useCase.execute(id, updateDto);

    expect(result.motivoCambio).toBe('NEW-MOTIVO');
    expect(mockContractRepository.update).toHaveBeenCalledWith(
      { contratoId: id },
      updateDto,
    );
  });

  it('should throw NotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockContractRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id, { motivoCambio: 'TEST' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
