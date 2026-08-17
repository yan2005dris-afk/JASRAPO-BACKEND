import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllPeriodsUseCase } from './find-all-periods.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { PeriodEntity } from '../../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';

describe('FindAllPeriodsUseCase', () => {
  let useCase: FindAllPeriodsUseCase;

  const mockPeriodRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllPeriodsUseCase,
        {
          provide: PeriodRepository,
          useValue: mockPeriodRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllPeriodsUseCase>(FindAllPeriodsUseCase);
  });

  it('should return paginated periods', async () => {
    const expectedResult = {
      data: [
        new PeriodEntity({
          periodoId: 1,
          nombre: '2026-01',
          fechaInicio: new Date('2026-01-01'),
          fechaFin: new Date('2026-01-31'),
          fechaVencimiento: new Date('2026-02-15'),
          estado: EstadoPeriodo.ABIERTO,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        ultimaPagina: 1,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    };

    mockPeriodRepository.findAll.mockResolvedValue(expectedResult);

    const result = await useCase.execute({}, { page: 1, limit: 10 });
    expect(result).toEqual(expectedResult);
    expect(mockPeriodRepository.findAll).toHaveBeenCalled();
  });
});
