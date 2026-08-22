import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateTariffCategoryUseCase } from './create-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { RubroRepository } from '../../../rubros/domain/repositories/rubro.repository';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { TarifaImpuestoNotFoundException } from '../../../rubros/domain/exceptions/rubro.exceptions';

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

  const mockRubroRepository = {
    create: jest.fn(),
    findTarifasImpuesto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTariffCategoryUseCase,
        {
          provide: TariffRepository,
          useValue: mockTariffRepository,
        },
        {
          provide: RubroRepository,
          useValue: mockRubroRepository,
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

  it('should create a tariff category and auto-create 3 default Rubros', async () => {
    const dto = {
      nombre: 'Residencial',
      descripcion: 'Categoria residencial',
      valorBase: 10,
      consumoMinimoMensual: 10,
      valorExcedenteM3: 0.5,
      tarifaImpuestoId: 2,
    };

    mockTariffRepository.findActiveByNombre.mockResolvedValue(null);
    mockTariffRepository.create.mockResolvedValue(
      new TariffCategoryEntity({
        categoriaTarifaId: 1,
        ...dto,
        activo: true,
      }),
    );
    mockRubroRepository.create.mockResolvedValue({} as any);

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.nombre).toBe(dto.nombre);
    expect(mockTariffRepository.create).toHaveBeenCalledWith(dto);
    // 2 Rubros auto-creados con categoriaTarifaId y tarifaImpuestoId (FIJO y VARIABLE)
    expect(mockRubroRepository.create).toHaveBeenCalledTimes(2);
    expect(mockRubroRepository.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        categoriaTarifaId: 1,
        tarifaImpuestoId: 2,
        tipoRubro: 'FIJO',
        esAutomatico: true,
      }),
    );
    expect(mockRubroRepository.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        categoriaTarifaId: 1,
        tarifaImpuestoId: 2,
        tipoRubro: 'VARIABLE',
        esAutomatico: true,
      }),
    );
  });

  it('should use the first active tarifa impuesto when tarifaImpuestoId is not provided', async () => {
    const dto = {
      nombre: 'Residencial',
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
    mockRubroRepository.findTarifasImpuesto.mockResolvedValue([
      { id: 5, activo: true } as any,
    ]);
    mockRubroRepository.create.mockResolvedValue({} as any);

    await useCase.execute(dto);

    expect(mockRubroRepository.findTarifasImpuesto).toHaveBeenCalled();
    expect(mockRubroRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tarifaImpuestoId: 5 }),
    );
  });

  it('should throw TarifaImpuestoNotFoundException when no active tarifa impuesto exists', async () => {
    const dto = { nombre: 'Residencial', valorBase: 10, valorExcedenteM3: 0.5 };

    mockTariffRepository.findActiveByNombre.mockResolvedValue(null);
    mockTariffRepository.create.mockResolvedValue(
      new TariffCategoryEntity({ categoriaTarifaId: 1, ...dto, activo: true }),
    );
    mockRubroRepository.findTarifasImpuesto.mockResolvedValue([]);

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      TarifaImpuestoNotFoundException,
    );
    expect(mockTariffRepository.create).not.toHaveBeenCalled();
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
