import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { CreateTariffCategoryUseCase } from './use-cases/create-tariff-category.use-case';
import { FindAllTariffCategoriesUseCase } from './use-cases/find-all-tariff-categories.use-case';
import { FindOneTariffCategoryUseCase } from './use-cases/find-one-tariff-category.use-case';
import { UpdateTariffCategoryUseCase } from './use-cases/update-tariff-category.use-case';
import { RemoveTariffCategoryUseCase } from './use-cases/remove-tariff-category.use-case';
import { TariffCategoryEntity } from '../domain/entities/tariff-category.entity';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('CategoriaTarifaService', () => {
  let service: CategoriaTarifaService;

  const mockCategoriaTarifa = new TariffCategoryEntity({
    categoriaTarifaId: 1,
    nombre: 'Residencial',
    descripcion: 'Categoría residencial estándar',
    valorBase: 10.0,
    consumoMinimoMensual: 10,
    valorExcedenteM3: 0.5,
    fechaVigenciaDesde: new Date(),
    fechaVigenciaHasta: null,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const mockCreateUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };
  const mockRemoveUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaTarifaService,
        { provide: CreateTariffCategoryUseCase, useValue: mockCreateUseCase },
        {
          provide: FindAllTariffCategoriesUseCase,
          useValue: mockFindAllUseCase,
        },
        {
          provide: FindOneTariffCategoryUseCase,
          useValue: mockFindOneUseCase,
        },
        { provide: UpdateTariffCategoryUseCase, useValue: mockUpdateUseCase },
        { provide: RemoveTariffCategoryUseCase, useValue: mockRemoveUseCase },
      ],
    }).compile();

    service = module.get<CategoriaTarifaService>(CategoriaTarifaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategoria', () => {
    it('should create categoria with default values', async () => {
      mockCreateUseCase.execute.mockResolvedValue(mockCategoriaTarifa);

      const result = await service.createCategoria({
        nombre: 'Residencial',
        descripcion: 'Descripción',
        valorBase: 10.0,
        consumoMinimoMensual: 10,
        valorExcedenteM3: 0.5,
      });

      expect(result.nombre).toBe('Residencial');
      expect(result.activo).toBe(true);
    });

    it('should throw EntityAlreadyExistsException when categoria with same name exists', async () => {
      mockCreateUseCase.execute.mockRejectedValue(
        new EntityAlreadyExistsException('CategoriaTarifa', 'Residencial'),
      );

      await expect(
        service.createCategoria({
          nombre: 'Residencial',
          valorBase: 10,
          valorExcedenteM3: 0.5,
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('getCategorias', () => {
    it('should return all active categorias', async () => {
      mockFindAllUseCase.execute.mockResolvedValue({
        data: [mockCategoriaTarifa],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await service.getCategorias();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].activo).toBe(true);
    });

    it('should filter by nombre with case-insensitive search', async () => {
      mockFindAllUseCase.execute.mockResolvedValue({
        data: [mockCategoriaTarifa],
        meta: { total: 1, page: 1, limit: 10 },
      });

      await service.getCategorias(1, 10, 'residencial');

      expect(mockFindAllUseCase.execute).toHaveBeenCalledWith(
        1,
        10,
        'residencial',
      );
    });
  });

  describe('findOneCategoria', () => {
    it('should return a single active tariff category by id', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(mockCategoriaTarifa);

      const result = await service.findOneCategoria(1);

      expect(result).toEqual(mockCategoriaTarifa);
      expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should throw EntityNotFoundException when not found', async () => {
      mockFindOneUseCase.execute.mockRejectedValue(
        new EntityNotFoundException('CategoriaTarifa', 999),
      );

      await expect(service.findOneCategoria(999)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('updateCategoria', () => {
    it('should update categoria with transaction', async () => {
      const updatedCategoria = new TariffCategoryEntity({
        ...mockCategoriaTarifa,
        nombre: 'Residencial Actualizado',
      });

      mockUpdateUseCase.execute.mockResolvedValue(updatedCategoria);

      const result = await service.updateCategoria(1, {
        nombre: 'Residencial Actualizado',
      });

      expect(result.nombre).toBe('Residencial Actualizado');
    });

    it('should throw EntityNotFoundException when categoria not found', async () => {
      mockUpdateUseCase.execute.mockRejectedValue(
        new EntityNotFoundException('CategoriaTarifa', 999),
      );

      await expect(
        service.updateCategoria(999, { nombre: 'New Name' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('deleteCategoria', () => {
    it('should soft delete categoria', async () => {
      const deletedEntity = new TariffCategoryEntity({
        ...mockCategoriaTarifa,
        activo: false,
        deletedAt: new Date(),
      });
      mockRemoveUseCase.execute.mockResolvedValue(deletedEntity);

      const result = await service.deleteCategoria(1);

      expect(result.activo).toBe(false);
      expect(mockRemoveUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should throw EntityNotFoundException when categoria not found', async () => {
      mockRemoveUseCase.execute.mockRejectedValue(
        new EntityNotFoundException('CategoriaTarifa', 999),
      );

      await expect(service.deleteCategoria(999)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
