import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateTariffCategoryUseCase } from './create-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { ConflictException } from '@nestjs/common';

describe('CreateTariffCategoryUseCase', () => {
  let useCase: CreateTariffCategoryUseCase;

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
        CreateTariffCategoryUseCase,
        {
          provide: TariffRepository,
          useValue: mockTariffRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTariffCategoryUseCase>(
      CreateTariffCategoryUseCase,
    );
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

    mockTariffRepository.findFirst.mockResolvedValue(null);
    mockTariffRepository.create.mockResolvedValue({
      categoriaTarifaId: 1,
      ...dto,
      activo: true,
    });

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.nombre).toBe(dto.nombre);
    expect(mockTariffRepository.findFirst).toHaveBeenCalled();
    expect(mockTariffRepository.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if category with same name exists', async () => {
    const dto = { nombre: 'Residencial' };
    mockTariffRepository.findFirst.mockResolvedValue({
      categoriaTarifaId: 1,
      nombre: 'Residencial',
    });

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      ConflictException,
    );
    expect(mockTariffRepository.create).not.toHaveBeenCalled();
  });
});
