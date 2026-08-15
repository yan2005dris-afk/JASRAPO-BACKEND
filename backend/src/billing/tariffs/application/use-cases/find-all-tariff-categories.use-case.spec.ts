import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllTariffCategoriesUseCase } from './find-all-tariff-categories.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';

describe('FindAllTariffCategoriesUseCase', () => {
  let useCase: FindAllTariffCategoriesUseCase;

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
        FindAllTariffCategoriesUseCase,
        {
          provide: TariffRepository,
          useValue: mockTariffRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllTariffCategoriesUseCase>(
      FindAllTariffCategoriesUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all active tariff categories with pagination', async () => {
    const mockData = [
      new TariffCategoryEntity({ categoriaTarifaId: 1, nombre: 'Residencial' }),
    ];
    mockTariffRepository.paginate.mockResolvedValue({
      data: mockData,
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        ultimaPagina: 1,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    });

    const result = await useCase.execute();

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(mockTariffRepository.paginate).toHaveBeenCalledWith(
      { nombre: undefined, activo: true },
      { page: 1, limit: 10 },
    );
  });

  it('should filter by name if provided', async () => {
    const mockData = [
      new TariffCategoryEntity({ categoriaTarifaId: 1, nombre: 'Residencial' }),
    ];
    mockTariffRepository.paginate.mockResolvedValue({
      data: mockData,
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        ultimaPagina: 1,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    });

    await useCase.execute(1, 10, 'residencial');

    expect(mockTariffRepository.paginate).toHaveBeenCalledWith(
      { nombre: 'residencial', activo: true },
      { page: 1, limit: 10 },
    );
  });
});
