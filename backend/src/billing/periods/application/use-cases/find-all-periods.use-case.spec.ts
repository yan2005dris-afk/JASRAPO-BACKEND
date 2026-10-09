import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllPeriodsUseCase } from './find-all-periods.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { periodRow } from '../../__test-utils__/period-row.factory';

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
        periodRow({
          periodoId: 1,
          nombre: '2026-01',
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
