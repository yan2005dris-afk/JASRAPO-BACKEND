import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneDiscountUseCase } from './find-one-discount.use-case';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { discountRow } from '../../__test-utils__/discount-row.factory';

describe('FindOneDiscountUseCase', () => {
  let useCase: FindOneDiscountUseCase;

  const mockDiscountRepository = {
    findUniqueCatalogo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneDiscountUseCase,
        { provide: DiscountRepository, useValue: mockDiscountRepository },
      ],
    }).compile();

    useCase = module.get<FindOneDiscountUseCase>(FindOneDiscountUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return discount if found', async () => {
    const row = discountRow({
      id: 1,
      nombre: 'Tercera Edad',
    });

    mockDiscountRepository.findUniqueCatalogo.mockResolvedValue(row);

    const result = await useCase.execute(1);

    expect(result.id).toBe(1);
    expect(result.nombre).toBe('Tercera Edad');
    expect(mockDiscountRepository.findUniqueCatalogo).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException if not found', async () => {
    mockDiscountRepository.findUniqueCatalogo.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });
});
