import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateTariffCategoryUseCase } from './create-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';

describe('CreateTariffCategoryUseCase', () => {
  let useCase: CreateTariffCategoryUseCase;

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

    mockTariffRepository.findActiveByNombre.mockResolvedValue(null);
    mockTariffRepository.create.mockResolvedValue(
      new TariffCategoryEntity({
        categoriaTarifaId: 1,
        ...dto,
        activo: true,
      }),
    );

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.nombre).toBe(dto.nombre);
    expect(mockTariffRepository.findActiveByNombre).toHaveBeenCalledWith('Residencial');
    expect(mockTariffRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should throw EntityAlreadyExistsException if category with same name exists', async () => {
    const dto = { nombre: 'Residencial', valorBase: 10, valorExcedenteM3: 0.5 };
    mockTariffRepository.findActiveByNombre.mockResolvedValue(
      new TariffCategoryEntity({
        categoriaTarifaId: 1,
        nombre: 'Residencial',
      }),
    );

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      EntityAlreadyExistsException,
    );
    expect(mockTariffRepository.create).not.toHaveBeenCalled();
  });
});
