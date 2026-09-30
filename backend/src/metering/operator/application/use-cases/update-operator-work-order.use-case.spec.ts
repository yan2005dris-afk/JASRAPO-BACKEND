import { UpdateOperatorWorkOrderUseCase } from './update-operator-work-order.use-case';
import { TipoActividadCodes } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateOperatorWorkOrderUseCase', () => {
  const orders = {
    findById: jest.fn(),
    updateOperatorWorkOrder: jest.fn(),
    verifyOperatorWorkOrderOwnership: jest.fn(),
  };
  const operators = { verifyMeterOwnership: jest.fn() };
  let useCase: UpdateOperatorWorkOrderUseCase;
  const date = new Date('2026-08-26T12:00:00.000Z');
  const order = (tipoActividad: string, medidorId: bigint | null = 10n) => ({
    ordenTrabajoId: 1n,
    rutaId: 2n,
    contratoId: 3n,
    medidorId,
    tipoActividad,
    estado: 'PENDIENTE',
    ordenVisita: 1,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    createdAt: date,
    updatedAt: date,
    deletedAt: null,
    lecturaId: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    orders.findById.mockReset();
    orders.updateOperatorWorkOrder.mockReset();
    orders.verifyOperatorWorkOrderOwnership.mockReset();
    operators.verifyMeterOwnership.mockReset();
    useCase = new UpdateOperatorWorkOrderUseCase(
      orders as any,
      operators as any,
    );
    orders.findById.mockResolvedValue(order(TipoActividadCodes.INSTALACION));
    orders.updateOperatorWorkOrder.mockResolvedValue(
      order(TipoActividadCodes.INSTALACION),
    );
  });

  it('rejects a missing order', async () => {
    orders.findById.mockResolvedValue(null);
    await expect(useCase.execute(1n, 7, {}, undefined)).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(orders.updateOperatorWorkOrder).not.toHaveBeenCalled();
  });

  it('accepts a meterless order with a real GPS payload through order ownership', async () => {
    orders.findById.mockResolvedValue(
      order(TipoActividadCodes.INSTALACION, null),
    );
    orders.updateOperatorWorkOrder.mockResolvedValue(
      order(TipoActividadCodes.INSTALACION, null),
    );

    await useCase.execute(
      1n,
      7,
      { latitud: -26.80828472, longitud: -65.25268137 },
      undefined,
    );

    expect(orders.verifyOperatorWorkOrderOwnership).toHaveBeenCalledWith(
      7,
      1n,
    );
    expect(operators.verifyMeterOwnership).not.toHaveBeenCalled();
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(1n, {
      estado: undefined,
      resultadoObservacion: undefined,
      evidenciaFotoUrl: undefined,
      completadoEn: undefined,
      latitud: -26.80828472,
      longitud: -65.25268137,
    });
  });

  it('rejects a meterless order when the operator does not own the route', async () => {
    orders.findById.mockResolvedValue(
      order(TipoActividadCodes.INSTALACION, null),
    );
    orders.verifyOperatorWorkOrderOwnership.mockRejectedValue(
      new InvalidDomainOperationException(
        'No puedes iniciar esta operación porque no estás asignado como operario a esta orden de trabajo.',
      ),
    );

    await expect(
      useCase.execute(
        1n,
        7,
        { latitud: -26.80828472, longitud: -65.25268137 },
        undefined,
      ),
    ).rejects.toThrow(
      'no estás asignado como operario a esta orden de trabajo',
    );
    expect(orders.verifyOperatorWorkOrderOwnership).toHaveBeenCalledWith(
      7,
      1n,
    );
    expect(orders.updateOperatorWorkOrder).not.toHaveBeenCalled();
  });

  it('routes a metered order through meter ownership only', async () => {
    orders.findById.mockResolvedValue(
      order(TipoActividadCodes.INSTALACION, 10n),
    );

    await useCase.execute(1n, 7, {}, undefined);

    expect(operators.verifyMeterOwnership).toHaveBeenCalledWith(7, 10n);
    expect(
      orders.verifyOperatorWorkOrderOwnership,
    ).not.toHaveBeenCalled();
  });

  it('rejects reading orders unless the update contains only complete GPS coordinates', async () => {
    orders.findById.mockResolvedValue(order(TipoActividadCodes.LECTURA));

    await expect(useCase.execute(1n, 7, {}, undefined)).rejects.toThrow(
      'solo permiten registrar latitud y longitud',
    );
    await expect(
      useCase.execute(
        1n,
        7,
        { latitud: -26.80828472, longitud: -65.25268137, estado: 'COMPLETADA' },
        undefined,
      ),
    ).rejects.toThrow('flujo de lecturas');
    expect(orders.updateOperatorWorkOrder).not.toHaveBeenCalled();
  });

  it('persists GPS coordinates on the work order linked to a reading', async () => {
    orders.findById.mockResolvedValue(order(TipoActividadCodes.LECTURA));
    orders.updateOperatorWorkOrder.mockResolvedValue(
      order(TipoActividadCodes.LECTURA),
    );

    await useCase.execute(
      1n,
      7,
      { latitud: -26.80828472, longitud: -65.25268137 },
      undefined,
    );

    expect(operators.verifyMeterOwnership).toHaveBeenCalledWith(7, 10n);
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(1n, {
      estado: undefined,
      resultadoObservacion: undefined,
      evidenciaFotoUrl: undefined,
      completadoEn: undefined,
      latitud: -26.80828472,
      longitud: -65.25268137,
    });
  });

  it('delegates ownership and stops when ownership is rejected', async () => {
    operators.verifyMeterOwnership.mockRejectedValue(
      new InvalidDomainOperationException('not yours'),
    );
    await expect(useCase.execute(1n, 7, {}, undefined)).rejects.toThrow(
      'not yours',
    );
    expect(operators.verifyMeterOwnership).toHaveBeenCalledWith(7, 10n);
    expect(orders.updateOperatorWorkOrder).not.toHaveBeenCalled();
  });

  it('maps generic order fields and delegates the exact data', async () => {
    const dto = {
      estado: 'COMPLETADA' as const,
      resultadoObservacion: 'ok',
      completadoEn: date.toISOString(),
    };
    await useCase.execute(1n, 7, dto, 'rustfs/key');
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(1n, {
      estado: 'COMPLETADA',
      resultadoObservacion: 'ok',
      evidenciaFotoUrl: 'rustfs/key',
      completadoEn: date,
    });
  });

  it('persists a valid installation through the repository', async () => {
    await useCase.execute(1n, 7, { estado: 'COMPLETADA' }, undefined);
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ estado: 'COMPLETADA' }),
    );
  });

  it('maps operator GPS coordinates into the update data', async () => {
    const dto = {
      estado: 'COMPLETADA' as const,
      latitud: -26.80828472,
      longitud: -65.25268137,
    };
    await useCase.execute(1n, 7, dto, undefined);
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(1n, {
      estado: 'COMPLETADA',
      resultadoObservacion: undefined,
      evidenciaFotoUrl: undefined,
      completadoEn: undefined,
      latitud: -26.80828472,
      longitud: -65.25268137,
    });
  });

  it('leaves GPS coordinates undefined when the DTO omits them', async () => {
    await useCase.execute(1n, 7, { estado: 'COMPLETADA' }, undefined);
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ latitud: undefined, longitud: undefined }),
    );
  });
});
