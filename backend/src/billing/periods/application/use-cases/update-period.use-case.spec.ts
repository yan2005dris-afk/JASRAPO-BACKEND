import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdatePeriodUseCase } from './update-period.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { periodRow } from '../../__test-utils__/period-row.factory';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdatePeriodUseCase', () => {
  let useCase: UpdatePeriodUseCase;

  const mockPeriodRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    findOverlapping: jest.fn(),
    update: jest.fn(),
  };

  const existingPeriod = periodRow({
    periodoId: 1,
    nombre: '2026-01',
    fechaInicio: new Date('2026-01-01'),
    fechaFin: new Date('2026-01-31'),
    fechaVencimiento: new Date('2026-02-15'),
    estado: EstadoPeriodo.ABIERTO,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePeriodUseCase,
        {
          provide: PeriodRepository,
          useValue: mockPeriodRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePeriodUseCase>(UpdatePeriodUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a period successfully', async () => {
    mockPeriodRepository.findById.mockResolvedValue(existingPeriod);
    mockPeriodRepository.findOverlapping.mockResolvedValue(null);
    mockPeriodRepository.update.mockResolvedValue(
      periodRow({
        ...existingPeriod,
        estado: EstadoPeriodo.CERRADO,
      }),
    );

    const result = await useCase.execute(1, {
      estado: EstadoPeriodo.CERRADO,
    });

    expect(result.estado).toBe(EstadoPeriodo.CERRADO);
    expect(mockPeriodRepository.findOverlapping).toHaveBeenCalledWith(
      existingPeriod.fechaInicio,
      existingPeriod.fechaFin,
      1,
    );
    expect(mockPeriodRepository.update).toHaveBeenCalled();
  });

  it('should throw EntityNotFoundException if period does not exist', async () => {
    mockPeriodRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99, { nombre: '2026-02' })).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw EntityAlreadyExistsException if updated name belongs to another period', async () => {
    mockPeriodRepository.findById.mockResolvedValue(existingPeriod);
    mockPeriodRepository.findByName.mockResolvedValue(
      periodRow({ periodoId: 2, nombre: '2026-02' }),
    );

    await expect(useCase.execute(1, { nombre: '2026-02' })).rejects.toThrow(
      EntityAlreadyExistsException,
    );
  });

  it('should throw InvalidDomainOperationException if dates are invalid', async () => {
    mockPeriodRepository.findById.mockResolvedValue(existingPeriod);

    await expect(
      useCase.execute(1, {
        fechaInicio: '2026-02-01',
        fechaFin: '2026-01-31',
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw InvalidDomainOperationException if updated dates overlap with another period', async () => {
    mockPeriodRepository.findById.mockResolvedValue(existingPeriod);
    mockPeriodRepository.findOverlapping.mockResolvedValue(
      periodRow({
        periodoId: 2,
        nombre: '2026-02',
        fechaInicio: new Date('2026-02-01'),
        fechaFin: new Date('2026-02-28'),
        fechaVencimiento: new Date('2026-03-15'),
      }),
    );

    await expect(
      useCase.execute(1, {
        fechaFin: '2026-02-10',
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
    await expect(
      useCase.execute(1, {
        fechaFin: '2026-02-10',
      }),
    ).rejects.toThrow(/se solapa con el período existente "2026-02"/);
  });
});
