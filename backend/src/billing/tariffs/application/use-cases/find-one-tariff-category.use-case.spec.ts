import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneTariffCategoryUseCase } from './find-one-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { NotFoundException } from '@nestjs/common';

describe('FindOneTariffCategoryUseCase', () => {
  let useCase: FindOneTariffCategoryUseCase;

  const mockTariffRepository = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneTariffCategoryUseCase,
        {
          provide: TariffRepository,
          useValue: mockTariffRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindOneTariffCategoryUseCase>(
      FindOneTariffCategoryUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return the tariff category if found and active', async () => {
    const mockTariff = {
      categoriaTarifaId: 1,
      nombre: 'Residencial',
      descripcion: 'Categoría residencial estándar',
      valorBase: 10.0,
      consumoMinimoMensual: 10,
      valorExcedenteM3: 0.5,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockTariffRepository.findFirst.mockResolvedValue(mockTariff);

    const result = await useCase.execute(1);

    expect(result.categoriaTarifaId).toBe(1);
    expect(result.nombre).toBe('Residencial');
    expect(mockTariffRepository.findFirst).toHaveBeenCalledWith({
      categoriaTarifaId: 1,
      activo: true,
      deletedAt: null,
    });
  });

  it('should throw NotFoundException if category is not found or inactive', async () => {
    mockTariffRepository.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    expect(mockTariffRepository.findFirst).toHaveBeenCalledWith({
      categoriaTarifaId: 999,
      activo: true,
      deletedAt: null,
    });
  });
});
