import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeConvenioWithCuotasSelect } from '../types/IConvenio';
import { FindOneConvenioUseCase } from './find-one-convenio.use-case';

describe('FindOneConvenioUseCase', () => {
  let useCase: FindOneConvenioUseCase;

  const mockPrismaService = {
    convenios: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneConvenioUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<FindOneConvenioUseCase>(FindOneConvenioUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return convenio with cuotas when found', async () => {
    const convenio = { convenioId: 1n, contratoId: 10n, cuotaConvenio: [] };
    mockPrismaService.convenios.findFirst.mockResolvedValue(convenio);

    const result = await useCase.execute(1n);

    expect(result).toBe(convenio);
    expect(mockPrismaService.convenios.findFirst).toHaveBeenCalledWith({
      where: { convenioId: 1n, deletedAt: null },
      select: safeConvenioWithCuotasSelect,
    });
  });

  it('should throw NotFoundException when convenio does not exist', async () => {
    mockPrismaService.convenios.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
  });
});
