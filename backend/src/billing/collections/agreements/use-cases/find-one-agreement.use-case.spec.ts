import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { safeAgreementWithInstallmentsSelect } from '../types/IAgreement';
import { FindOneAgreementUseCase } from './find-one-agreement.use-case';

describe('FindOneAgreementUseCase', () => {
  let useCase: FindOneAgreementUseCase;

  const mockPrismaService = {
    convenios: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneAgreementUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
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

  it('should return agreement with installments when found', async () => {
    const convenio = { convenioId: 1n, contratoId: 10n, cuotaConvenio: [] };
    mockPrismaService.convenios.findFirst.mockResolvedValue(convenio);

    const result = await useCase.execute(1n);

    expect(result).toBe(convenio);
    expect(mockPrismaService.convenios.findFirst).toHaveBeenCalledWith({
      where: { convenioId: 1n, deletedAt: null },
      select: safeAgreementWithInstallmentsSelect,
    });
  });

  it('should throw NotFoundException when agreement does not exist', async () => {
    mockPrismaService.convenios.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
  });
});
