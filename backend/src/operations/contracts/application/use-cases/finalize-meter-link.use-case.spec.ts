import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FinalizeMeterLinkUseCase } from './finalize-meter-link.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('FinalizeMeterLinkUseCase', () => {
  let useCase: FinalizeMeterLinkUseCase;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should finalize active link by contratoId (S3.1)', async () => {
    const contratoId = BigInt(1);

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: null,
    });
    mockContractRepository.finalizeActiveMeterLink.mockResolvedValue({
      contratoId,
      estado: 'ACTIVO',
    } as any);

    const result = await useCase.execute(contratoId);

    expect(mockContractRepository.findUnique).toHaveBeenCalledWith({
      contratoId,
    });
    expect(mockContractRepository.finalizeActiveMeterLink).toHaveBeenCalledWith(
      contratoId,
    );
    expect(result).toMatchObject({ contratoId, estado: 'ACTIVO' });
  });

  it('should throw NotFoundException when no active link exists (S3.2)', async () => {
    const contratoId = BigInt(1);

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: null,
    });
    mockContractRepository.finalizeActiveMeterLink.mockRejectedValue(
      new NotFoundException('No hay un vínculo activo para este contrato'),
    );

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when contract does not exist (S3.3)', async () => {
    const contratoId = BigInt(999);

    mockContractRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when contract is soft-deleted (S3.4)', async () => {
    const contratoId = BigInt(1);

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when medidor not found after finalizing (S3.5)', async () => {
    const contratoId = BigInt(1);

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: null,
    });
    mockContractRepository.finalizeActiveMeterLink.mockRejectedValue(
      new NotFoundException(`Medidor con ID 999 no encontrado`),
    );

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
