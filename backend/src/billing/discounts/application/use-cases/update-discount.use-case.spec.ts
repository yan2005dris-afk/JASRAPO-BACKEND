import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateDiscountUseCase } from './update-discount.use-case';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { FindOneDiscountUseCase } from './find-one-discount.use-case';
import { discountRow } from '../../__test-utils__/discount-row.factory';

describe('UpdateDiscountUseCase', () => {
  let useCase: UpdateDiscountUseCase;

  const mockDiscountRepository = {
    updateCatalogo: jest.fn(),
  };

  const mockFindOneUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDiscountUseCase,
        { provide: DiscountRepository, useValue: mockDiscountRepository },
        { provide: FindOneDiscountUseCase, useValue: mockFindOneUseCase },
      ],
    }).compile();

    useCase = module.get<UpdateDiscountUseCase>(UpdateDiscountUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update discount when found', async () => {
    const existing = discountRow({
      id: 1,
      nombre: 'Tercera Edad',
    });

    const updated = discountRow({
      id: 1,
      nombre: 'Tercera Edad 2',
    });

    mockFindOneUseCase.execute.mockResolvedValue(existing);
    mockDiscountRepository.updateCatalogo.mockResolvedValue(updated);

    const result = await useCase.execute(1, { nombre: 'Tercera Edad 2' });

    expect(result.nombre).toBe('Tercera Edad 2');
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1);
    expect(mockDiscountRepository.updateCatalogo).toHaveBeenCalledWith(1, {
      nombre: 'Tercera Edad 2',
    });
  });
});
