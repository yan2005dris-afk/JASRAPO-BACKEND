import { Test } from '@nestjs/testing';
import { FindWorkOrderNoveltiesUseCase } from './find-work-order-novelties.use-case';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';

describe('FindWorkOrderNoveltiesUseCase', () => {
  let useCase: FindWorkOrderNoveltiesUseCase;
  let repoMock: any;

  beforeEach(async () => {
    repoMock = { findMany: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        FindWorkOrderNoveltiesUseCase,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
      ],
    }).compile();
    useCase = module.get<FindWorkOrderNoveltiesUseCase>(
      FindWorkOrderNoveltiesUseCase,
    );
  });

  it('delegates filters to the repository', async () => {
    const filters = { page: 1, limit: 10 };
    const expected = { data: [], total: 0 };
    repoMock.findMany.mockResolvedValue(expected);

    expect(await useCase.execute(filters)).toBe(expected);
    expect(repoMock.findMany).toHaveBeenCalledWith(filters);
  });
});
