import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveTariffCategoryUseCase } from './remove-tariff-category.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemoveTariffCategoryUseCase', () => {
  let useCase: RemoveTariffCategoryUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    categoriaTarifa: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveTariffCategoryUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<RemoveTariffCategoryUseCase>(
      RemoveTariffCategoryUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a tariff category', async () => {
    const id = 1;
    const current = {
      categoriaTarifaId: id,
      nombre: 'Residencial',
      activo: true,
    };

    mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(current);
    mockPrismaService.categoriaTarifa.update.mockResolvedValue({
      ...current,
      activo: false,
      deletedAt: new Date(),
    });

    const result = await useCase.execute(id);

    expect(result.activo).toBe(false);
    expect(result.deletedAt).toBeDefined();
    expect(mockPrismaService.categoriaTarifa.findFirst).toHaveBeenCalled();
    expect(mockPrismaService.categoriaTarifa.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException if category does not exist', async () => {
    mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
