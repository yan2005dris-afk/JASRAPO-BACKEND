import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GenerateAnnualPeriodsUseCase } from './generate-annual-periods.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { periodRow } from '../../__test-utils__/period-row.factory';
import { EstadoPeriodo } from 'src/shared/enums';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import type { CreatePeriodData } from '../../domain/types/period.types';
import type { PeriodRow } from '../../domain/types/period.types';

describe('GenerateAnnualPeriodsUseCase', () => {
  let useCase: GenerateAnnualPeriodsUseCase;

  const mockPeriodRepository = {
    findByName: jest.fn(),
    findByNames: jest.fn(),
    findOverlapping: jest.fn(),
    create: jest.fn(),
    createBatch: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateAnnualPeriodsUseCase,
        {
          provide: PeriodRepository,
          useValue: mockPeriodRepository,
        },
      ],
    }).compile();

    useCase = module.get<GenerateAnnualPeriodsUseCase>(
      GenerateAnnualPeriodsUseCase,
    );
  });

  it('should generate 12 monthly periods for a year when none exist in a single batch', async () => {
    mockPeriodRepository.findByNames.mockResolvedValue([]);
    mockPeriodRepository.findOverlapping.mockResolvedValue(null);
    mockPeriodRepository.createBatch.mockImplementation((items) =>
      Promise.resolve(
        (items as CreatePeriodData[]).map((data, idx: number) =>
          periodRow({ periodoId: idx + 1, ...data }),
        ),
      ),
    );

    const result = await useCase.execute({
      year: 2026,
      diaVencimiento: 20,
      estadoInicial: EstadoPeriodo.CERRADO,
    });

    expect(result).toHaveLength(12);
    expect(mockPeriodRepository.findByNames).toHaveBeenCalledTimes(1);
    expect(mockPeriodRepository.createBatch).toHaveBeenCalledTimes(1);

    const createdArg = mockPeriodRepository.createBatch.mock.calls[0][0];
    expect(createdArg).toHaveLength(12);
    expect(createdArg[0]).toEqual(
      expect.objectContaining({
        nombre: 'Enero 2026',
        estado: EstadoPeriodo.CERRADO,
      }),
    );
    expect(createdArg[11]).toEqual(
      expect.objectContaining({
        nombre: 'Diciembre 2026',
        estado: EstadoPeriodo.CERRADO,
      }),
    );
  });

  it('should skip creating already existing periods in that year and only batch insert missing ones', async () => {
    const existingEnero: PeriodRow = periodRow({
      periodoId: 10,
      nombre: 'Enero 2026',
      fechaInicio: new Date(Date.UTC(2026, 0, 1)),
      fechaFin: new Date(Date.UTC(2026, 1, 0, 23, 59, 59, 999)),
      fechaVencimiento: new Date(Date.UTC(2026, 1, 15, 23, 59, 59, 999)),
      estado: EstadoPeriodo.ABIERTO,
    });

    mockPeriodRepository.findByNames.mockResolvedValue([existingEnero]);
    mockPeriodRepository.findOverlapping.mockResolvedValue(null);
    mockPeriodRepository.createBatch.mockImplementation((items) =>
      Promise.resolve(
        (items as CreatePeriodData[]).map((data, idx: number) =>
          periodRow({ periodoId: idx + 2, ...data }),
        ),
      ),
    );

    const result = await useCase.execute({ year: 2026 });

    expect(result).toHaveLength(11);
    expect(mockPeriodRepository.findByNames).toHaveBeenCalledTimes(1);
    expect(mockPeriodRepository.createBatch).toHaveBeenCalledTimes(1);

    const createdCallArg = mockPeriodRepository.createBatch.mock.calls[0][0];
    expect(createdCallArg).toHaveLength(11);
    expect(createdCallArg.some((p: any) => p.nombre === 'Enero 2026')).toBe(
      false,
    );
    expect(createdCallArg.some((p: any) => p.nombre === 'Febrero 2026')).toBe(
      true,
    );
  });

  it('should throw InvalidDomainOperationException when all 12 periods already exist', async () => {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const all12: PeriodRow[] = Array.from({ length: 12 }, (_, i) =>
      periodRow({
        periodoId: i + 1,
        nombre: `${monthNames[i]} 2026`,
        fechaInicio: new Date(Date.UTC(2026, i, 1)),
        fechaFin: new Date(Date.UTC(2026, i + 1, 0, 23, 59, 59, 999)),
        fechaVencimiento: new Date(Date.UTC(2026, i + 1, 15, 23, 59, 59, 999)),
        estado: EstadoPeriodo.CERRADO,
      }),
    );

    mockPeriodRepository.findByNames.mockResolvedValue(all12);

    await expect(useCase.execute({ year: 2026 })).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockPeriodRepository.createBatch).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException if a period overlaps with an existing foreign period', async () => {
    mockPeriodRepository.findByNames.mockResolvedValue([]);
    mockPeriodRepository.findOverlapping.mockResolvedValueOnce(
      periodRow({
        periodoId: 99,
        nombre: 'Periodo Especial Verano',
        fechaInicio: new Date(Date.UTC(2026, 0, 10)),
        fechaFin: new Date(Date.UTC(2026, 1, 10)),
        fechaVencimiento: new Date(Date.UTC(2026, 1, 20)),
        estado: EstadoPeriodo.ABIERTO,
      }),
    );

    await expect(useCase.execute({ year: 2026 })).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockPeriodRepository.createBatch).not.toHaveBeenCalled();
  });
});
