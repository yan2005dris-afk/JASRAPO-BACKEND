import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GenerateAnnualPeriodsUseCase } from './generate-annual-periods.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { PeriodEntity } from '../../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';

describe('GenerateAnnualPeriodsUseCase', () => {
  let useCase: GenerateAnnualPeriodsUseCase;

  const mockPeriodRepository = {
    findByName: jest.fn(),
    findByNames: jest.fn(),
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
    mockPeriodRepository.createBatch.mockImplementation((items) =>
      Promise.resolve(
        items.map(
          (data: any, idx: number) =>
            new PeriodEntity({
              periodoId: idx + 1,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
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
    const existingEnero = new PeriodEntity({
      periodoId: 10,
      nombre: 'Enero 2026',
      fechaInicio: new Date(Date.UTC(2026, 0, 1)),
      fechaFin: new Date(Date.UTC(2026, 1, 0, 23, 59, 59, 999)),
      fechaVencimiento: new Date(Date.UTC(2026, 1, 15, 23, 59, 59, 999)),
      estado: EstadoPeriodo.ABIERTO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockPeriodRepository.findByNames.mockResolvedValue([existingEnero]);
    mockPeriodRepository.createBatch.mockImplementation((items) =>
      Promise.resolve(
        items.map(
          (data: any, idx: number) =>
            new PeriodEntity({
              periodoId: idx + 2,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
        ),
      ),
    );

    const result = await useCase.execute({ year: 2026 });

    expect(result).toHaveLength(12);
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

    const eneroResult = result.find((p) => p.nombre === 'Enero 2026');
    expect(eneroResult?.periodoId).toBe(10);
    expect(eneroResult?.estado).toBe(EstadoPeriodo.ABIERTO);
  });
});
