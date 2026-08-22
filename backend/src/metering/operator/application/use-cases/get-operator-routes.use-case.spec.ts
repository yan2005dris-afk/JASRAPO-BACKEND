import { Test } from '@nestjs/testing';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import { GetOperatorRoutesUseCase } from './get-operator-routes.use-case';

describe('GetOperatorRoutesUseCase', () => {
  const repository = {
    findActivePeriod: jest.fn(),
    findRoutesByOperator: jest.fn(),
  };

  let useCase: GetOperatorRoutesUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        GetOperatorRoutesUseCase,
        { provide: OperatorRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(GetOperatorRoutesUseCase);
  });

  it('returns routes with work orders for the active period', async () => {
    const routes = [{ rutaId: 1n, ordenesTrabajo: [], paradas: [] }];
    repository.findActivePeriod.mockResolvedValue({ periodoId: 20 });
    repository.findRoutesByOperator.mockResolvedValue(routes);

    await expect(useCase.execute(10, 'TOMA_LECTURA')).resolves.toBe(routes);
    expect(repository.findRoutesByOperator).toHaveBeenCalledWith(
      10,
      20,
      'TOMA_LECTURA',
    );
  });

  it('fails when there is no active period', async () => {
    repository.findActivePeriod.mockResolvedValue(null);

    await expect(useCase.execute(10)).rejects.toBeInstanceOf(
      EntityNotFoundException,
    );
    expect(repository.findRoutesByOperator).not.toHaveBeenCalled();
  });
});
