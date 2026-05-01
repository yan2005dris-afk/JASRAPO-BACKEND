import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveFieldWorkUseCase } from './remove-field-work.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemoveFieldWorkUseCase', () => {
  let useCase: RemoveFieldWorkUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    novedadOperativa: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveFieldWorkUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<RemoveFieldWorkUseCase>(RemoveFieldWorkUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should soft delete a field work', async () => {
    const id = BigInt(1);
    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue({
      novedadId: id,
      deletedAt: null,
    });
    mockPrismaService.novedadOperativa.update.mockResolvedValue({
      novedadId: id,
      deletedAt: new Date(),
    });

    const result = await useCase.execute(id);

    expect(result.message).toContain('eliminada');
    expect(mockPrismaService.novedadOperativa.update).toHaveBeenCalledWith({
      where: { novedadId: id },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw NotFoundException if not found', async () => {
    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
  });
});
