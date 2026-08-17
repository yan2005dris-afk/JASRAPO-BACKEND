import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeletePeriodUseCase } from './delete-period.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { PeriodEntity } from '../../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('DeletePeriodUseCase', () => {
  let useCase: DeletePeriodUseCase;

  const mockPeriodRepository = {
    findById: jest.fn(),
    countRelations: jest.fn(),
    delete: jest.fn(),
  };

  const existingPeriod = new PeriodEntity({
    periodoId: 1,
    nombre: '2026-01',
    fechaInicio: new Date('2026-01-01'),
    fechaFin: new Date('2026-01-31'),
    fechaVencimiento: new Date('2026-02-15'),
    estado: EstadoPeriodo.ABIERTO,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePeriodUseCase,
        {
          provide: PeriodRepository,
          useValue: mockPeriodRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeletePeriodUseCase>(DeletePeriodUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a period when it has no relations', async () => {
    mockPeriodRepository.findById.mockResolvedValue(existingPeriod);
    mockPeriodRepository.countRelations.mockResolvedValue({
      lecturas: 0,
      prefacturas: 0,
      lotes: 0,
      rutas: 0,
    });
    mockPeriodRepository.delete.mockResolvedValue(existingPeriod);

    const result = await useCase.execute(1);
    expect(result).toBe(existingPeriod);
    expect(mockPeriodRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException if period does not exist', async () => {
    mockPeriodRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException if period has associated lecturas or prefacturas', async () => {
    mockPeriodRepository.findById.mockResolvedValue(existingPeriod);
    mockPeriodRepository.countRelations.mockResolvedValue({
      lecturas: 5,
      prefacturas: 2,
      lotes: 0,
      rutas: 0,
    });

    await expect(useCase.execute(1)).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockPeriodRepository.delete).not.toHaveBeenCalled();
  });
});
