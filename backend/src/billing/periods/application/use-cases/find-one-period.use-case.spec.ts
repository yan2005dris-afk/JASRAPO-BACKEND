import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOnePeriodUseCase } from './find-one-period.use-case';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import { periodRow } from '../../__test-utils__/period-row.factory';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOnePeriodUseCase', () => {
  let useCase: FindOnePeriodUseCase;

  const mockPeriodRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOnePeriodUseCase,
        {
          provide: PeriodRepository,
          useValue: mockPeriodRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindOnePeriodUseCase>(FindOnePeriodUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a period when found', async () => {
    const period = periodRow({
      periodoId: 1,
      nombre: '2026-01',
    });

    mockPeriodRepository.findById.mockResolvedValue(period);

    const result = await useCase.execute(1);
    expect(result).toBe(period);
    expect(mockPeriodRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException when period does not exist', async () => {
    mockPeriodRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(EntityNotFoundException);
  });
});
