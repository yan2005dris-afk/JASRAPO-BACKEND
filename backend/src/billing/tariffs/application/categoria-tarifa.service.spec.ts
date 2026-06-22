import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { TariffRepository } from '../domain/repositories/tariff.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateTariffCategoryUseCase } from './use-cases/create-tariff-category.use-case';
import { FindAllTariffCategoriesUseCase } from './use-cases/find-all-tariff-categories.use-case';
import { FindOneTariffCategoryUseCase } from './use-cases/find-one-tariff-category.use-case';
import { UpdateTariffCategoryUseCase } from './use-cases/update-tariff-category.use-case';
import { RemoveTariffCategoryUseCase } from './use-cases/remove-tariff-category.use-case';

describe('CategoriaTarifaService', () => {
  let service: CategoriaTarifaService;

  const mockCategoriaTarifa = {
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
  };

  const mockTariffRepository = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn(),
  };

  const mockCreateUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };
  const mockRemoveUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaTarifaService,
        { provide: TariffRepository, useValue: mockTariffRepository },
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

    it('should throw ConflictException when categoria with same name exists', async () => {
      mockCreateUseCase.execute.mockRejectedValue(
        new ConflictException('Ya existe una categoría con ese nombre'),
      );

      await expect(
        service.createCategoria({
          nombre: 'Residencial',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getCategorias', () => {
    it('should return all active categorias', async () => {
      mockFindAllUseCase.execute.mockResolvedValue([mockCategoriaTarifa]);

      const result = await service.getCategorias();

      expect(result).toHaveLength(1);
      expect(result[0].activo).toBe(true);
    });

    it('should return empty array when no categorias exist', async () => {
      mockFindAllUseCase.execute.mockResolvedValue([]);

      const result = await service.getCategorias();

      expect(result).toEqual([]);
    });

    it('should filter by nombre with case-insensitive search', async () => {
      mockFindAllUseCase.execute.mockResolvedValue([mockCategoriaTarifa]);

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

    it('should throw NotFoundException when not found', async () => {
      mockFindOneUseCase.execute.mockRejectedValue(
        new NotFoundException('Categoría no encontrada'),
      );

      await expect(service.findOneCategoria(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCategoria', () => {
    it('should update categoria with transaction', async () => {
      const updatedCategoria = {
        ...mockCategoriaTarifa,
        nombre: 'Residencial Actualizado',
      };

      mockUpdateUseCase.execute.mockResolvedValue(updatedCategoria);

      const result = await service.updateCategoria(1, {
        nombre: 'Residencial Actualizado',
      });

      expect(result.nombre).toBe('Residencial Actualizado');
    });

    it('should throw NotFoundException when categoria not found', async () => {
      mockUpdateUseCase.execute.mockRejectedValue(
        new NotFoundException('Categoría no encontrada'),
      );

      await expect(
        service.updateCategoria(999, { nombre: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new nombre already exists', async () => {
      mockUpdateUseCase.execute.mockRejectedValue(
        new ConflictException('Ya existe una categoría activa con ese nombre'),
      );

      await expect(
        service.updateCategoria(1, { nombre: 'Comercial' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteCategoria', () => {
    it('should soft delete categoria', async () => {
      const deleteResponse = {
        message: 'Categoría de tarifa eliminada exitosamente',
        statusCode: 200,
      };
      mockRemoveUseCase.execute.mockResolvedValue(deleteResponse);

      const result = await service.deleteCategoria(1);

      expect(result).toEqual({
        message: 'Categoría de tarifa eliminada exitosamente',
        statusCode: 200,
      });
      expect(mockRemoveUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when categoria not found', async () => {
      mockRemoveUseCase.execute.mockRejectedValue(
        new NotFoundException('Categoría no encontrada'),
      );

      await expect(service.deleteCategoria(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when categoria already deleted', async () => {
      mockRemoveUseCase.execute.mockRejectedValue(
        new NotFoundException('Categoría no encontrada'),
      );

      await expect(service.deleteCategoria(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
