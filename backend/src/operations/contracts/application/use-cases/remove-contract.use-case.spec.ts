import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveContractUseCase } from './remove-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('RemoveContractUseCase', () => {
  let useCase: RemoveContractUseCase;

  const mockContractRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a contract if it exists', async () => {
    const id = BigInt(1);
    const existing = new ContractEntity({ contratoId: id, deletedAt: null });
    const deleted = new ContractEntity({ contratoId: id, deletedAt: new Date() });

    mockContractRepository.findById.mockResolvedValue(existing);
    mockContractRepository.softDelete.mockResolvedValue(deleted);

    const result = await useCase.execute(id);

    expect(result).toEqual(deleted);
    expect(mockContractRepository.findById).toHaveBeenCalledWith(id);
    expect(mockContractRepository.softDelete).toHaveBeenCalledWith(id);
  });

  it('should throw EntityNotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockContractRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(EntityNotFoundException);
  });
});
