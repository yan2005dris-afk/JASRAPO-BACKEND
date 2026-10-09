import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveDiscountUseCase } from './remove-discount.use-case';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { FindOneDiscountUseCase } from './find-one-discount.use-case';
import { discountRow } from '../../__test-utils__/discount-row.factory';

describe('RemoveDiscountUseCase', () => {
  let useCase: RemoveDiscountUseCase;

  const mockDiscountRepository = {
    updateCatalogo: jest.fn(),
  };

  const mockFindOneUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveDiscountUseCase,
        { provide: DiscountRepository, useValue: mockDiscountRepository },
        { provide: FindOneDiscountUseCase, useValue: mockFindOneUseCase },
      ],
    }).compile();

    useCase = module.get<RemoveDiscountUseCase>(RemoveDiscountUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete discount by setting activo=false', async () => {
    const existing = discountRow({
      id: 1,
      nombre: 'Tercera Edad',
    });

    const deleted = discountRow({
      id: 1,
      nombre: 'Tercera Edad',
      activo: false,
    });

    mockFindOneUseCase.execute.mockResolvedValue(existing);
    mockDiscountRepository.updateCatalogo.mockResolvedValue(deleted);

    const result = await useCase.execute(1);

    expect(result.activo).toBe(false);
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1);
    expect(mockDiscountRepository.updateCatalogo).toHaveBeenCalledWith(1, {
      activo: false,
    });
  });
});
