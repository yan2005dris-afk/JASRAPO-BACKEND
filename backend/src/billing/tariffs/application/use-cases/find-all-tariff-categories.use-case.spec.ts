import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllTariffCategoriesUseCase } from './find-all-tariff-categories.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';

describe('FindAllTariffCategoriesUseCase', () => {
  let useCase: FindAllTariffCategoriesUseCase;

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
    const mockData = [{ categoriaTarifaId: 1, nombre: 'Residencial' }];
    mockTariffRepository.findMany.mockResolvedValue(mockData);
    mockTariffRepository.count.mockResolvedValue(1);

    const result = await useCase.execute();

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(mockTariffRepository.findMany).toHaveBeenCalledWith({
      where: {
        activo: true,
        deletedAt: null,
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockTariffRepository.count).toHaveBeenCalledWith({
      where: {
        activo: true,
        deletedAt: null,
      },
    });
  });

  it('should filter by name if provided', async () => {
    const mockData = [{ categoriaTarifaId: 1, nombre: 'Residencial' }];
    mockTariffRepository.findMany.mockResolvedValue(mockData);
    mockTariffRepository.count.mockResolvedValue(1);

    await useCase.execute(1, 10, 'residencial');

    expect(mockTariffRepository.findMany).toHaveBeenCalledWith({
      where: {
        activo: true,
        deletedAt: null,
        nombre: {
          contains: 'residencial',
          mode: 'insensitive',
        },
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  });
});
