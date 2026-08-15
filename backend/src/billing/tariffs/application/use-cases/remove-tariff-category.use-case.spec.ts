import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveTariffCategoryUseCase } from './remove-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';

describe('RemoveTariffCategoryUseCase', () => {
  let useCase: RemoveTariffCategoryUseCase;

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
    const current = new TariffCategoryEntity({
      categoriaTarifaId: id,
      nombre: 'Residencial',
      activo: true,
    });
    const deleted = new TariffCategoryEntity({
      ...current,
      activo: false,
      deletedAt: new Date(),
    });

    mockTariffRepository.findById.mockResolvedValue(current);
    mockTariffRepository.softDelete.mockResolvedValue(deleted);

    const result = await useCase.execute(id);

    expect(result.activo).toBe(false);
    expect(mockTariffRepository.findById).toHaveBeenCalledWith(id);
    expect(mockTariffRepository.softDelete).toHaveBeenCalledWith(id);
  });

  it('should throw EntityNotFoundException if category does not exist', async () => {
    mockTariffRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(EntityNotFoundException);
    expect(mockTariffRepository.findById).toHaveBeenCalledWith(1);
  });
});
