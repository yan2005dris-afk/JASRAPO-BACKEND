import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllDiscountsUseCase } from './find-all-discounts.use-case';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { DiscountEntity } from '../../domain/entities/discount.entity';

describe('FindAllDiscountsUseCase', () => {
  let useCase: FindAllDiscountsUseCase;

  const mockDiscountRepository = {
    findManyCatalogo: jest.fn(),
    countCatalogo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllDiscountsUseCase,
        { provide: DiscountRepository, useValue: mockDiscountRepository },
      ],
    }).compile();

    useCase = module.get<FindAllDiscountsUseCase>(FindAllDiscountsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated list of discounts', async () => {
    const mockEntities = [
      new DiscountEntity({
        id: 1,
        nombre: 'Tercera Edad',
        tipoDescuento: 'TERCERA_EDAD',
        valor: 50,
        esPorcentaje: true,
        rubroId: null,
        activo: true,
        aplicaAutomatico: false,
        descripcion: null,
      }),
    ];

    mockDiscountRepository.findManyCatalogo.mockResolvedValue(mockEntities);
    mockDiscountRepository.countCatalogo.mockResolvedValue(1);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(mockDiscountRepository.findManyCatalogo).toHaveBeenCalled();
  });

  it('should filter by tipoDescuento and aplicaAutomatico', async () => {
    mockDiscountRepository.findManyCatalogo.mockResolvedValue([]);
    mockDiscountRepository.countCatalogo.mockResolvedValue(0);

    await useCase.execute({
      tipoDescuento: 'TERCERA_EDAD',
      aplicaAutomatico: 'true',
    });

    expect(mockDiscountRepository.findManyCatalogo).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          activo: true,
          tipoDescuento: 'TERCERA_EDAD',
          aplicaAutomatico: true,
        },
      }),
    );
  });
});
