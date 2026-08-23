import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DiscountsService } from './discounts.service';
import { CreateDiscountUseCase } from './use-cases/create-discount.use-case';
import { FindAllDiscountsUseCase } from './use-cases/find-all-discounts.use-case';
import { FindOneDiscountUseCase } from './use-cases/find-one-discount.use-case';
import { UpdateDiscountUseCase } from './use-cases/update-discount.use-case';
import { RemoveDiscountUseCase } from './use-cases/remove-discount.use-case';
import { ApplyDiscountToPreinvoiceUseCase } from './use-cases/apply-discount-to-preinvoice.use-case';
import { GetDiscountRubrosUseCase } from './use-cases/get-discount-rubros.use-case';
import { DiscountEntity } from '../domain/entities/discount.entity';

describe('DiscountsService', () => {
  let service: DiscountsService;

  const mockEntity = new DiscountEntity({
    id: 1,
    nombre: 'Tercera Edad',
    tipoDescuento: 'TERCERA_EDAD',
    valor: 50,
    esPorcentaje: true,
    rubroId: null,
    activo: true,
    aplicaAutomatico: false,
    descripcion: null,
  });

  const mockCreate = { execute: jest.fn() };
  const mockFindAll = { execute: jest.fn() };
  const mockFindOne = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockRemove = { execute: jest.fn() };
  const mockApply = { execute: jest.fn() };
  const mockGetRubros = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountsService,
        { provide: CreateDiscountUseCase, useValue: mockCreate },
        { provide: FindAllDiscountsUseCase, useValue: mockFindAll },
        { provide: FindOneDiscountUseCase, useValue: mockFindOne },
        { provide: UpdateDiscountUseCase, useValue: mockUpdate },
        { provide: RemoveDiscountUseCase, useValue: mockRemove },
        { provide: ApplyDiscountToPreinvoiceUseCase, useValue: mockApply },
        { provide: GetDiscountRubrosUseCase, useValue: mockGetRubros },
      ],
    }).compile();

    service = module.get<DiscountsService>(DiscountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate create to CreateDiscountUseCase', async () => {
    mockCreate.execute.mockResolvedValue(mockEntity);

    const result = await service.create({
      nombre: 'Tercera Edad',
      tipoDescuento: 'TERCERA_EDAD',
      valor: 50,
      esPorcentaje: true,
    });

    expect(result.id).toBe(1);
    expect(mockCreate.execute).toHaveBeenCalled();
  });

  it('should delegate findAll to FindAllDiscountsUseCase', async () => {
    mockFindAll.execute.mockResolvedValue({
      data: [mockEntity],
      meta: { total: 1, page: 1, limit: 10 },
    });

    const result = await service.findAll({});

    expect(result.data).toHaveLength(1);
    expect(mockFindAll.execute).toHaveBeenCalled();
  });

  it('should delegate findOne to FindOneDiscountUseCase', async () => {
    mockFindOne.execute.mockResolvedValue(mockEntity);

    const result = await service.findOne(1);

    expect(result.id).toBe(1);
    expect(mockFindOne.execute).toHaveBeenCalledWith(1);
  });

  it('should delegate update to UpdateDiscountUseCase', async () => {
    mockUpdate.execute.mockResolvedValue(mockEntity);

    const result = await service.update(1, { nombre: 'Updated' });

    expect(result.id).toBe(1);
    expect(mockUpdate.execute).toHaveBeenCalledWith(1, { nombre: 'Updated' });
  });

  it('should delegate remove to RemoveDiscountUseCase', async () => {
    mockRemove.execute.mockResolvedValue(mockEntity);

    const result = await service.remove(1);

    expect(result.id).toBe(1);
    expect(mockRemove.execute).toHaveBeenCalledWith(1);
  });

  it('should delegate applyToPreinvoice to ApplyDiscountToPreinvoiceUseCase', async () => {
    mockApply.execute.mockResolvedValue({ prefacturaId: 10 });

    const result = await service.applyToPreinvoice(10, {
      catalogoDescuentoId: 1,
    });

    expect(result).toEqual({ prefacturaId: 10 });
    expect(mockApply.execute).toHaveBeenCalledWith(10, {
      catalogoDescuentoId: 1,
    });
  });
});
