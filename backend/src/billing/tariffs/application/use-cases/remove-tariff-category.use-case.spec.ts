import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveTariffCategoryUseCase } from './remove-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { NotFoundException } from '@nestjs/common';

describe('RemoveTariffCategoryUseCase', () => {
  let useCase: RemoveTariffCategoryUseCase;

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
        RemoveTariffCategoryUseCase,
        {
          provide: TariffRepository,
          useValue: mockTariffRepository,
        },
      ],
    }).compile();

    useCase = module.get<RemoveTariffCategoryUseCase>(
      RemoveTariffCategoryUseCase,
    );
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

    mockTariffRepository.findFirst.mockResolvedValue(current);
    mockTariffRepository.update.mockResolvedValue({
      ...current,
      activo: false,
      deletedAt: new Date(),
    });

    const result = await useCase.execute(id);

    expect(result.message).toBe('Categoría de tarifa eliminada exitosamente');
    expect(result.statusCode).toBe(200);
    expect(mockTariffRepository.findFirst).toHaveBeenCalled();
    expect(mockTariffRepository.update).toHaveBeenCalledWith(
      { categoriaTarifaId: id },
      expect.objectContaining({
        activo: false,
        deletedAt: expect.any(Date),
      }),
    );
  });

  it('should throw NotFoundException if category does not exist', async () => {
    mockTariffRepository.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
