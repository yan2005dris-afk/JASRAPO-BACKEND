import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from '../../application/discounts.service';
import { discountRow } from '../../__test-utils__/discount-row.factory';

describe('DiscountsController', () => {
  let controller: DiscountsController;

  const mockRow = discountRow({
    id: 1,
    nombre: 'Tercera Edad',
  });

  const mockDiscountsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    applyToPreinvoice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountsController],
      providers: [
        { provide: DiscountsService, useValue: mockDiscountsService },
      ],
    }).compile();

    controller = module.get<DiscountsController>(DiscountsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return DiscountResponseDto', async () => {
      mockDiscountsService.create.mockResolvedValue(mockRow);

      const result = await controller.create({
        nombre: 'Tercera Edad',
        tipoDescuento: 'TERCERA_EDAD',
        valor: 50,
        esPorcentaje: true,
      });

      expect(result.id).toBe(1);
      expect(result.nombre).toBe('Tercera Edad');
      expect(mockDiscountsService.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated DiscountResponseDtos', async () => {
      mockDiscountsService.findAll.mockResolvedValue({
        data: [mockRow],
        meta: { total: 1, page: 1, limit: 10 },
      });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return single DiscountResponseDto', async () => {
      mockDiscountsService.findOne.mockResolvedValue(mockRow);

      const result = await controller.findOne(1);

      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update and return DiscountResponseDto', async () => {
      mockDiscountsService.update.mockResolvedValue(mockRow);

      const result = await controller.update(1, { nombre: 'Updated' });

      expect(result.id).toBe(1);
    });
  });

  describe('remove', () => {
    it('should remove and return DiscountResponseDto', async () => {
      mockDiscountsService.remove.mockResolvedValue(mockRow);

      const result = await controller.remove(1);

      expect(result.id).toBe(1);
    });
  });

  describe('applyToPreinvoice', () => {
    it('should apply discount to preinvoice', async () => {
      mockDiscountsService.applyToPreinvoice.mockResolvedValue({
        prefacturaId: 5,
      });

      const result = await controller.applyToPreinvoice(5, {
        catalogoDescuentoId: 1,
      });

      expect(result).toEqual({ prefacturaId: 5 });
    });
  });
});
