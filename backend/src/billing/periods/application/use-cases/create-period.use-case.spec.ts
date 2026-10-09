import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreatePeriodUseCase } from './create-period.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { periodRow } from '../../__test-utils__/period-row.factory';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import {
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('CreatePeriodUseCase', () => {
  let useCase: CreatePeriodUseCase;

  const mockPeriodRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findOverlapping: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    countRelations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePeriodUseCase,
        {
          provide: PeriodRepository,
          useValue: mockPeriodRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreatePeriodUseCase>(CreatePeriodUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a period successfully', async () => {
    const dto = {
      nombre: '2026-01',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-31',
      fechaVencimiento: '2026-02-15',
    };

    mockPeriodRepository.findByName.mockResolvedValue(null);
    mockPeriodRepository.findOverlapping.mockResolvedValue(null);
    mockPeriodRepository.create.mockResolvedValue(
      periodRow({
        periodoId: 1,
        nombre: '2026-01',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-01-31'),
        fechaVencimiento: new Date('2026-02-15'),
        estado: EstadoPeriodo.ABIERTO,
      }),
    );

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.nombre).toBe('2026-01');
    expect(result.estado).toBe(EstadoPeriodo.ABIERTO);
    expect(mockPeriodRepository.findByName).toHaveBeenCalledWith('2026-01');
    expect(mockPeriodRepository.findOverlapping).toHaveBeenCalled();
    expect(mockPeriodRepository.create).toHaveBeenCalled();
  });

  it('should throw EntityAlreadyExistsException if period name already exists', async () => {
    const dto = {
      nombre: '2026-01',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-31',
      fechaVencimiento: '2026-02-15',
    };

    mockPeriodRepository.findByName.mockResolvedValue(
      periodRow({ periodoId: 1, nombre: '2026-01' }),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(
      EntityAlreadyExistsException,
    );
    expect(mockPeriodRepository.create).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException if date range overlaps with existing period', async () => {
    const dto = {
      nombre: 'Enero Especial',
      fechaInicio: '2026-01-15',
      fechaFin: '2026-02-15',
      fechaVencimiento: '2026-03-01',
    };

    mockPeriodRepository.findByName.mockResolvedValue(null);
    mockPeriodRepository.findOverlapping.mockResolvedValue(
      periodRow({
        periodoId: 2,
        nombre: 'Enero 2026',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-01-31'),
        fechaVencimiento: new Date('2026-02-15'),
      }),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );
    await expect(useCase.execute(dto)).rejects.toThrow(
      /se solapa con el período existente "Enero 2026"/,
    );
    expect(mockPeriodRepository.create).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException if fechaInicio > fechaFin', async () => {
    const dto = {
      nombre: '2026-01',
      fechaInicio: '2026-02-01',
      fechaFin: '2026-01-31',
      fechaVencimiento: '2026-02-15',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockPeriodRepository.create).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException if fechaFin > fechaVencimiento', async () => {
    const dto = {
      nombre: '2026-01',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-20',
      fechaVencimiento: '2026-02-15',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockPeriodRepository.create).not.toHaveBeenCalled();
  });
});
