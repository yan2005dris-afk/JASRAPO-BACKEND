import { ForbiddenDomainException } from 'src/shared/domain/exceptions/domain.exception';
import { UpdateOperatorReadingUseCase } from './update-operator-reading.use-case';

describe('UpdateOperatorReadingUseCase', () => {
  const operatorRepository = {
    findReadingWithDetails: jest.fn(),
    findActivePeriod: jest.fn(),
    findActiveRoutes: jest.fn(),
  };
  const updateReadingUseCase = {
    execute: jest.fn(),
  };
  let useCase: UpdateOperatorReadingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateOperatorReadingUseCase(
      operatorRepository as any,
      updateReadingUseCase as any,
    );
  });

  it('rejects a reading without a direct work-order assignment for the operator', async () => {
    operatorRepository.findReadingWithDetails.mockResolvedValue({
      lecturaId: 1n,
      estado: 'PENDIENTE',
      ordenesTrabajo: [
        {
          rutaId: 20n,
          ruta: { operarioId: 99, periodoId: 7 },
        },
      ],
      medidor: null,
    });
    operatorRepository.findActivePeriod.mockResolvedValue({ periodoId: 7 });
    operatorRepository.findActiveRoutes.mockResolvedValue([
      { rutaId: 10n, comunidadId: 1, sectorId: null },
    ]);

    await expect(useCase.execute(1n, 42, {}, undefined)).rejects.toBeInstanceOf(
      ForbiddenDomainException,
    );

    expect(updateReadingUseCase.execute).not.toHaveBeenCalled();
  });

  it('auto-transitions route from PENDIENTE to EN_PROGRESO on operator reading upload', async () => {
    operatorRepository.findReadingWithDetails.mockResolvedValue({
      lecturaId: 1n,
      estado: 'PENDIENTE',
      ordenesTrabajo: [
        {
          rutaId: 10n,
          ruta: { operarioId: 42, periodoId: 7, estado: 'PENDIENTE' },
        },
      ],
      medidor: null,
    });
    operatorRepository.findActivePeriod.mockResolvedValue({ periodoId: 7 });
    operatorRepository.findActiveRoutes.mockResolvedValue([
      { rutaId: 10n, comunidadId: 1, sectorId: null, estado: 'PENDIENTE' },
    ]);
    operatorRepository.updateRouteState = jest.fn().mockResolvedValue({});
    updateReadingUseCase.execute.mockResolvedValue({ lecturaId: 1n, estado: 'POR_REVISION' });

    const result = await useCase.execute(1n, 42, { lecturaActual: 150 });

    expect(operatorRepository.updateRouteState).toHaveBeenCalledWith(
      10n,
      expect.objectContaining({
        estado: 'EN_PROGRESO',
        fechaInicio: expect.any(Date),
      }),
      'PENDIENTE',
    );
    expect(updateReadingUseCase.execute).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ lecturaActual: 150 }),
      'POR_REVISION',
    );
    expect(result).toEqual({ lecturaId: 1n, estado: 'POR_REVISION' });
  });
});
