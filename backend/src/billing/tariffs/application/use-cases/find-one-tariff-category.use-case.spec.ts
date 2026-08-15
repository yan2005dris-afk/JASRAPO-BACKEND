import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneTariffCategoryUseCase } from './find-one-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';

describe('FindOneTariffCategoryUseCase', () => {
  let useCase: FindOneTariffCategoryUseCase;

  const mockTariffRepository = {
    findById: jest.fn(),
    findActiveByNombre: jest.fn(),
    paginate: jest.fn(),
    create: jest.fn(),
    createNewVersion: jest.fn(),
    softDelete: jest.fn(),
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
    const mockTariff = new TariffCategoryEntity({
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
    });
    mockTariffRepository.findById.mockResolvedValue(mockTariff);

    const result = await useCase.execute(1);

    expect(result.categoriaTarifaId).toBe(1);
    expect(result.nombre).toBe('Residencial');
    expect(mockTariffRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException if category is not found or inactive', async () => {
    mockTariffRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
    expect(mockTariffRepository.findById).toHaveBeenCalledWith(999);
  });
});
