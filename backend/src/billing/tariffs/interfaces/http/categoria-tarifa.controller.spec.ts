import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CategoriaTarifaController } from './categoria-tarifa.controller';
import { CategoriaTarifaService } from '../../application/categoria-tarifa.service';
import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';

describe('CategoriaTarifaController', () => {
  let controller: CategoriaTarifaController;

  const mockEntity = new TariffCategoryEntity({
    categoriaTarifaId: 1,
    nombre: 'Residencial',
    descripcion: 'Residencial básica',
    valorBase: 5,
    consumoMinimoMensual: 10,
    valorExcedenteM3: 0.5,
    fechaVigenciaDesde: new Date('2026-01-01'),
    fechaVigenciaHasta: null,
    activo: true,
  });

  const mockService = {
    createCategoria: jest.fn(),
    getCategorias: jest.fn(),
    findOneCategoria: jest.fn(),
    updateCategoria: jest.fn(),
    deleteCategoria: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaTarifaController],
      providers: [
        {
          provide: CategoriaTarifaService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CategoriaTarifaController>(
      CategoriaTarifaController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return ResponseDto', async () => {
      mockService.createCategoria.mockResolvedValue(mockEntity);

      const result = await controller.create({
        nombre: 'Residencial',
        valorBase: 5,
        valorExcedenteM3: 0.5,
      });

      expect(result.categoriaTarifaId).toBe(1);
      expect(result.nombre).toBe('Residencial');
      expect(mockService.createCategoria).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated ResponseDtos', async () => {
      mockService.getCategorias.mockResolvedValue({
        data: [mockEntity],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].categoriaTarifaId).toBe(1);
      expect(mockService.getCategorias).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('findOne', () => {
    it('should return a single ResponseDto', async () => {
      mockService.findOneCategoria.mockResolvedValue(mockEntity);

      const result = await controller.findOne(1);

      expect(result.categoriaTarifaId).toBe(1);
      expect(mockService.findOneCategoria).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update and return ResponseDto', async () => {
      mockService.updateCategoria.mockResolvedValue(mockEntity);

      const result = await controller.update(1, { nombre: 'Residencial Edit' });

      expect(result.categoriaTarifaId).toBe(1);
      expect(mockService.updateCategoria).toHaveBeenCalledWith(1, {
        nombre: 'Residencial Edit',
      });
    });
  });

  describe('remove', () => {
    it('should delete and return ResponseDto', async () => {
      mockService.deleteCategoria.mockResolvedValue(mockEntity);

      const result = await controller.remove(1);

      expect(result.categoriaTarifaId).toBe(1);
      expect(mockService.deleteCategoria).toHaveBeenCalledWith(1);
    });
  });
});
