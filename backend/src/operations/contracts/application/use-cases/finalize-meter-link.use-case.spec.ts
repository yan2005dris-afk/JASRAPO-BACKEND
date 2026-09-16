import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FinalizeMeterLinkUseCase } from './finalize-meter-link.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('FinalizeMeterLinkUseCase', () => {
  let useCase: FinalizeMeterLinkUseCase;

  const mockContractRepository = {
    findById: jest.fn(),
    finalizeActiveMeterLink: jest.fn(),
  };

  beforeEach(async () => {
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should finalize active link by contratoId', async () => {
    const contratoId = BigInt(1);
    const mockContract = new ContractEntity({
      contratoId,
      estadoServicio: 'ACTIVO',
    });

    mockContractRepository.findById.mockResolvedValue(mockContract);
    mockContractRepository.finalizeActiveMeterLink.mockResolvedValue(
      mockContract,
    );

    const result = await useCase.execute(contratoId);

    expect(mockContractRepository.findById).toHaveBeenCalledWith(contratoId);
    expect(mockContractRepository.finalizeActiveMeterLink).toHaveBeenCalledWith(
      contratoId,
    );
    expect(result).toMatchObject({ contratoId, estadoServicio: 'ACTIVO' });
  });

  it('should throw InvalidDomainOperationException when no active link exists', async () => {
    const contratoId = BigInt(1);
    const mockContract = new ContractEntity({
      contratoId,
    });

    mockContractRepository.findById.mockResolvedValue(mockContract);
    mockContractRepository.finalizeActiveMeterLink.mockRejectedValue(
      new InvalidDomainOperationException(
        'No hay un vínculo activo para este contrato',
      ),
    );

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should throw EntityNotFoundException when contract does not exist', async () => {
    const contratoId = BigInt(999);
    mockContractRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      EntityNotFoundException,
    );
  });
});
