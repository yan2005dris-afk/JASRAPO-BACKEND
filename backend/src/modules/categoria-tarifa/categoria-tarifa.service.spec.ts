import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { PrismaService } from 'src/database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriaTarifaService', () => {
  let service: CategoriaTarifaService;
  let prismaService: PrismaService;

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

  const mockPrismaService = {
    categoriaTarifa: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaTarifaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriaTarifaService>(CategoriaTarifaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategoria', () => {
    it('should create categoria with default values', async () => {
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(null);
      mockPrismaService.categoriaTarifa.create.mockResolvedValue(
        mockCategoriaTarifa,
      );

      const result = await service.createCategoria({
        nombre: 'Residencial',
        descripcion: 'Descripción',
        valorBase: 10.0,
        consumoMinimoMensual: 10,
        valorExcedenteM3: 0.5,
      });

      expect(result.nombre).toBe('Residencial');
      expect(result.activo).toBe(true);
      expect(result.fechaVigenciaDesde).toBeDefined();
    });

    it('should throw ConflictException when categoria with same name exists', async () => {
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue({
        categoriaTarifaId: 1,
        nombre: 'Residencial',
      });

      await expect(
        service.createCategoria({
          nombre: 'Residencial',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getCategorias', () => {
    it('should return all active categorias', async () => {
      mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([
        mockCategoriaTarifa,
      ]);

      const result = await service.getCategorias();

      expect(result).toHaveLength(1);
      expect(result[0].activo).toBe(true);
      expect(mockPrismaService.categoriaTarifa.findMany).toHaveBeenCalledWith({
        where: {
          activo: true,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no categorias exist', async () => {
      mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([]);

      const result = await service.getCategorias();

      expect(result).toEqual([]);
    });

    it('should filter by nombre with case-insensitive search', async () => {
      mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([
        mockCategoriaTarifa,
      ]);

      await service.getCategorias('residencial');

      expect(mockPrismaService.categoriaTarifa.findMany).toHaveBeenCalledWith({
        where: {
          activo: true,
          deletedAt: null,
          nombre: {
            contains: 'residencial',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('buscarCategoriaPorNombre', () => {
    it('should return categoria by nombre search', async () => {
      mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([
        mockCategoriaTarifa,
      ]);

      const result = await service.buscarCategoriaPorNombre('Residencial');

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Residencial');
    });

    it('should throw NotFoundException when no categoria found', async () => {
      mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([]);

      await expect(service.buscarCategoriaPorNombre('NoExist')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should search case-insensitively', async () => {
      mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([
        mockCategoriaTarifa,
      ]);

      await service.buscarCategoriaPorNombre('RESIDENCIAL');

      expect(mockPrismaService.categoriaTarifa.findMany).toHaveBeenCalledWith({
        where: {
          nombre: {
            contains: 'RESIDENCIAL',
            mode: 'insensitive',
          },
          activo: true,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateCategoria', () => {
    it('should update categoria with transaction', async () => {
      const updatedCategoria = {
        ...mockCategoriaTarifa,
        nombre: 'Residencial Actualizado',
      };

      // Initial findFirst returns current
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(
        mockCategoriaTarifa,
      );

      // Setup transaction mock
      const txMock = {
        categoriaTarifa: {
          update: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockResolvedValue(updatedCategoria),
          findFirst: jest.fn(),
        },
      };
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(txMock);
      });

      const result = await service.updateCategoria(1, {
        nombre: 'Residencial Actualizado',
      });

      expect(result.nombre).toBe('Residencial Actualizado');
    });

    it('should throw NotFoundException when categoria not found', async () => {
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(null);

      await expect(
        service.updateCategoria(999, { nombre: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new nombre already exists', async () => {
      // Initial findFirst returns current
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(
        mockCategoriaTarifa,
      );

      // Setup transaction mock with duplicate check
      const txMock = {
        categoriaTarifa: {
          update: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue({
            // This simulates finding a category with the new name
            categoriaTarifaId: 2,
            nombre: 'Comercial',
          }),
          create: jest.fn(),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        try {
          return await callback(txMock);
        } catch (e) {
          throw e;
        }
      });

      await expect(
        service.updateCategoria(1, { nombre: 'Comercial' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteCategoria', () => {
    it('should soft delete categoria', async () => {
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(
        mockCategoriaTarifa,
      );
      mockPrismaService.categoriaTarifa.update.mockResolvedValue({
        ...mockCategoriaTarifa,
        activo: false,
        deletedAt: new Date(),
      });

      const result = await service.deleteCategoria(1);

      expect(result.activo).toBe(false);
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw NotFoundException when categoria not found', async () => {
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(null);

      await expect(service.deleteCategoria(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when categoria already deleted', async () => {
      // When querying with deletedAt: null, a deleted record won't be found
      mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(null);

      await expect(service.deleteCategoria(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
