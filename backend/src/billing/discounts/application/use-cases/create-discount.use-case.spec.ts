import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateDiscountUseCase } from './create-discount.use-case';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { discountRow } from '../../__test-utils__/discount-row.factory';

describe('CreateDiscountUseCase', () => {
  let useCase: CreateDiscountUseCase;

  const mockDiscountRepository = {
    createCatalogo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDiscountUseCase,
        { provide: DiscountRepository, useValue: mockDiscountRepository },
      ],
    }).compile();

    useCase = module.get<CreateDiscountUseCase>(CreateDiscountUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a discount successfully', async () => {
    const dto = {
      nombre: 'Tercera Edad',
      tipoDescuento: 'TERCERA_EDAD',
      valor: 50,
      esPorcentaje: true,
      rubroId: 1,
    };

    const mockRow = discountRow({
      id: 1,
      ...dto,
    });

    mockDiscountRepository.createCatalogo.mockResolvedValue(mockRow);

    const result = await useCase.execute(dto as any);

    expect(result.id).toBe(1);
    expect(result.nombre).toBe('Tercera Edad');
    expect(mockDiscountRepository.createCatalogo).toHaveBeenCalledWith({
      ...dto,
      rubroId: 1,
    });
  });
});
