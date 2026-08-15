import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { FindOneAgreementUseCase } from './find-one-agreement.use-case';
import { AgreementEntity } from '../../domain/entities/agreement.entity';

describe('FindOneAgreementUseCase', () => {
  let useCase: FindOneAgreementUseCase;

  const mockAgreementRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneAgreementUseCase,
        { provide: AgreementRepository, useValue: mockAgreementRepository },
      ],
    }).compile();

    useCase = module.get<FindOneAgreementUseCase>(FindOneAgreementUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return agreement when found', async () => {
    const convenio = new AgreementEntity({ convenioId: 1n, contratoId: 10n });
    mockAgreementRepository.findById.mockResolvedValue(convenio);

    const result = await useCase.execute(1n);

    expect(result).toBe(convenio);
    expect(mockAgreementRepository.findById).toHaveBeenCalledWith(1n);
  });

  it('should throw NotFoundException when agreement does not exist', async () => {
    mockAgreementRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
  });
});
