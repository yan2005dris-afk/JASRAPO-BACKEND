import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateTariffCategoryUseCase } from './create-tariff-category.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('CreateTariffCategoryUseCase', () => {
  let useCase: CreateTariffCategoryUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    categoriaTarifa: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTariffCategoryUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateTariffCategoryUseCase>(
      CreateTariffCategoryUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a tariff category successfully', async () => {
    const dto = {
      nombre: 'Residencial',
      descripcion: 'Categoría residencial',
      valorBase: 10,
      consumoMinimoMensual: 10,
      valorExcedenteM3: 0.5,
    };

    mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(null);
    mockPrismaService.categoriaTarifa.create.mockResolvedValue({
      categoriaTarifaId: 1,
      ...dto,
      activo: true,
    });

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.nombre).toBe(dto.nombre);
    expect(mockPrismaService.categoriaTarifa.findFirst).toHaveBeenCalled();
    expect(mockPrismaService.categoriaTarifa.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if category with same name exists', async () => {
    const dto = { nombre: 'Residencial' };
    mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue({
      categoriaTarifaId: 1,
      nombre: 'Residencial',
    });

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      ConflictException,
    );
    expect(mockPrismaService.categoriaTarifa.create).not.toHaveBeenCalled();
  });
});
