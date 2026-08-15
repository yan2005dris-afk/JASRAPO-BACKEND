import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateTariffCategoryUseCase } from './update-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { EntityNotFoundException, EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';

describe('UpdateTariffCategoryUseCase', () => {
  let useCase: UpdateTariffCategoryUseCase;

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
        UpdateTariffCategoryUseCase,
        {
          provide: TariffRepository,
          useValue: mockTariffRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTariffCategoryUseCase>(
      UpdateTariffCategoryUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a new version of a tariff category', async () => {
    const id = 1;
    const dto = { nombre: 'Residencial Plus' };
    const current = new TariffCategoryEntity({
      categoriaTarifaId: id,
      nombre: 'Residencial',
      activo: true,
      valorBase: 10,
      valorExcedenteM3: 0.5,
    });

    mockTariffRepository.findById.mockResolvedValue(current);
    mockTariffRepository.createNewVersion.mockResolvedValue(
      new TariffCategoryEntity({
        categoriaTarifaId: 2,
        nombre: 'Residencial Plus',
        activo: true,
        valorBase: 10,
        valorExcedenteM3: 0.5,
      }),
    );

    const result = await useCase.execute(id, dto);

    expect(result).toBeDefined();
    expect(mockTariffRepository.findById).toHaveBeenCalledWith(id);
    expect(mockTariffRepository.createNewVersion).toHaveBeenCalledWith(id, dto);
    expect(result.nombre).toBe('Residencial Plus');
  });

  it('should throw EntityNotFoundException if category does not exist', async () => {
    mockTariffRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, { nombre: 'New' })).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should propagate EntityAlreadyExistsException from repository', async () => {
    const id = 1;
    const dto = { nombre: 'Comercial' };
    const current = new TariffCategoryEntity({
      categoriaTarifaId: id,
      nombre: 'Residencial',
      activo: true,
    });

    mockTariffRepository.findById.mockResolvedValue(current);
    mockTariffRepository.createNewVersion.mockRejectedValue(
      new EntityAlreadyExistsException('CategoriaTarifa', 'Comercial'),
    );

    await expect(useCase.execute(id, dto)).rejects.toThrow(
      EntityAlreadyExistsException,
    );
  });
});
