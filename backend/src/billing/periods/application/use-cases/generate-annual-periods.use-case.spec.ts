import { Test, TestingModule } from '@nestjs/testing';
import { GenerateAnnualPeriodsUseCase } from './generate-annual-periods.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { PeriodEntity } from '../../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';

describe('GenerateAnnualPeriodsUseCase', () => {
  let useCase: GenerateAnnualPeriodsUseCase;

  const mockPeriodRepository = {
    findByName: jest.fn(),
    create: jest.fn(),
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

  it('should generate 12 monthly periods for a year when none exist', async () => {
    mockPeriodRepository.findByName.mockResolvedValue(null);
    mockPeriodRepository.create.mockImplementation((data) =>
      Promise.resolve(
        new PeriodEntity({
          periodoId: 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    const result = await useCase.execute({
      year: 2026,
      diaVencimiento: 20,
      estadoInicial: EstadoPeriodo.PENDIENTE,
    });

    expect(result).toHaveLength(12);
    expect(mockPeriodRepository.create).toHaveBeenCalledTimes(12);

    expect(mockPeriodRepository.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        nombre: 'Enero 2026',
        estado: EstadoPeriodo.PENDIENTE,
      }),
    );

    expect(mockPeriodRepository.create).toHaveBeenNthCalledWith(
      12,
      expect.objectContaining({
        nombre: 'Diciembre 2026',
        estado: EstadoPeriodo.PENDIENTE,
      }),
    );
  });

  it('should skip creating already existing periods in that year', async () => {
    const existingEnero = new PeriodEntity({
      periodoId: 10,
      nombre: 'Enero 2026',
      fechaInicio: new Date('2026-01-01'),
      fechaFin: new Date('2026-01-31'),
      fechaVencimiento: new Date('2026-02-15'),
      estado: EstadoPeriodo.ABIERTO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockPeriodRepository.findByName.mockImplementation((name: string) => {
      if (name === 'Enero 2026') return Promise.resolve(existingEnero);
      return Promise.resolve(null);
    });

    mockPeriodRepository.create.mockImplementation((data) =>
      Promise.resolve(
        new PeriodEntity({
          periodoId: 2,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    const result = await useCase.execute({ year: 2026 });

    expect(result).toHaveLength(12);
    expect(result[0].nombre).toBe('Enero 2026');
    expect(result[0].periodoId).toBe(10);
    // 1 skipped, 11 created
    expect(mockPeriodRepository.create).toHaveBeenCalledTimes(11);
  });
});
