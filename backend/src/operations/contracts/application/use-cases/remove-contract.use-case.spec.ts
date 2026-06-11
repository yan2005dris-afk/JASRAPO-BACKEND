import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveContractUseCase } from './remove-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { NotFoundException } from '@nestjs/common';

describe('RemoveContractUseCase', () => {
  let useCase: RemoveContractUseCase;

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
        RemoveContractUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<RemoveContractUseCase>(RemoveContractUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a contract if it exists', async () => {
    const id = BigInt(1);
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: null,
    });
    mockContractRepository.update.mockResolvedValue({
      contratoId: id,
      deletedAt: new Date(),
    });

    const result = await useCase.execute(id);

    expect(result.message).toContain(`Contrato con ID ${id} eliminado`);
    expect(mockContractRepository.update).toHaveBeenCalledWith(
      { contratoId: id },
      { deletedAt: expect.any(Date) },
    );
  });

  it('should throw NotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockContractRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
  });
});
