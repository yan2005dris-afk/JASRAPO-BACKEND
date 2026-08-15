import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneDiscountUseCase } from './find-one-discount.use-case';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { DiscountEntity } from '../../domain/entities/discount.entity';

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
    const entity = new DiscountEntity({
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

    mockDiscountRepository.findUniqueCatalogo.mockResolvedValue(entity);

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
