import { Test } from '@nestjs/testing';
import { EstadoRuta } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import { UpdateRouteStateUseCase } from './update-route-state.use-case';

describe('UpdateRouteStateUseCase', () => {
  const repository = {
    findActivePeriod: jest.fn(),
    findRoutesByOperator: jest.fn(),
    updateRouteState: jest.fn(),
  };

  let useCase: UpdateRouteStateUseCase;

  const route = {
    rutaId: 1n,
    operarioId: 10,
    estado: EstadoRuta.PENDIENTE,
    ordenesTrabajo: [],
    paradas: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    repository.findActivePeriod.mockResolvedValue({ periodoId: 20 });
    repository.findRoutesByOperator.mockResolvedValue([route]);
    repository.updateRouteState.mockImplementation(
      async (_id: bigint, data: Record<string, unknown>) => ({
        ...route,
        ...data,
      }),
    );

    const module = await Test.createTestingModule({
      providers: [
        UpdateRouteStateUseCase,
        { provide: OperatorRepository, useValue: repository },
      ],
    }).compile();
    useCase = module.get(UpdateRouteStateUseCase);
  });

  it('starts an assigned route with optimistic concurrency', async () => {
    await useCase.execute(1n, 10, { estado: EstadoRuta.EN_PROGRESO });

    expect(repository.updateRouteState).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({
        estado: EstadoRuta.EN_PROGRESO,
        fechaInicio: expect.any(Date),
      }),
      EstadoRuta.PENDIENTE,
    );
  });

  it('requires an observation when cancelling a route', async () => {
    await expect(
      useCase.execute(1n, 10, { estado: EstadoRuta.CANCELADA }),
    ).rejects.toBeInstanceOf(InvalidDomainOperationException);
    expect(repository.updateRouteState).not.toHaveBeenCalled();
  });

  it('does not expose a route assigned to another operator', async () => {
    repository.findRoutesByOperator.mockResolvedValue([]);

    await expect(
      useCase.execute(1n, 10, { estado: EstadoRuta.EN_PROGRESO }),
    ).rejects.toBeInstanceOf(EntityNotFoundException);
  });

  it('rejects transitions from a terminal state', async () => {
    repository.findRoutesByOperator.mockResolvedValue([
      { ...route, estado: EstadoRuta.COMPLETADA },
    ]);

    await expect(
      useCase.execute(1n, 10, { estado: EstadoRuta.CANCELADA }),
    ).rejects.toBeInstanceOf(InvalidDomainOperationException);
  });
});
