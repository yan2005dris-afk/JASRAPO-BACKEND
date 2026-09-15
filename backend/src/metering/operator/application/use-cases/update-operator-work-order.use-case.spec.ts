import { UpdateOperatorWorkOrderUseCase } from './update-operator-work-order.use-case';
import { TipoActividadCodes } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateOperatorWorkOrderUseCase', () => {
  const orders = { findById: jest.fn(), updateOperatorWorkOrder: jest.fn() };
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

  it.each([
    [TipoActividadCodes.LECTURA, 10n, 'flujo de lecturas'],
    [TipoActividadCodes.INSTALACION, null, 'medidor asignado'],
  ])(
    'rejects invalid order prerequisites (%s)',
    async (type, meter, message) => {
      orders.findById.mockResolvedValue(order(type, meter));
      await expect(useCase.execute(1n, 7, {}, undefined)).rejects.toThrow(
        message,
      );
      expect(orders.updateOperatorWorkOrder).not.toHaveBeenCalled();
    },
  );

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

  it('rejects reconnection without seal confirmation', async () => {
    orders.findById.mockResolvedValue(order(TipoActividadCodes.RECONEXION));
    await expect(
      useCase.execute(1n, 7, { confirmacionRetiroSello: false }, undefined),
    ).rejects.toThrow('retiro del sello');
  });

  it('rejects partial inspection execution fields', async () => {
    orders.findById.mockResolvedValue(order(TipoActividadCodes.INSPECCION));
    await expect(
      useCase.execute(1n, 7, { estadoSellos: 'INTEGRO' }, undefined),
    ).rejects.toThrow('estado de sellos');
    expect(orders.updateOperatorWorkOrder).not.toHaveBeenCalled();
  });

  it('maps dates and activity fields and delegates the exact data', async () => {
    const dto = {
      estado: 'COMPLETADA',
      resultadoObservacion: 'ok',
      completadoEn: date.toISOString(),
      estadoSellos: 'INTEGRO',
      hayFugas: false,
      confirmacionRetiroSello: true,
    };
    await useCase.execute(1n, 7, dto, 'rustfs/key');
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(1n, {
      estado: 'COMPLETADA',
      resultadoObservacion: 'ok',
      evidenciaFotoUrl: 'rustfs/key',
      completadoEn: date,
      estadoSellos: 'INTEGRO',
      hayFugas: false,
      confirmacionRetiroSello: true,
    });
  });

  it('persists a valid installation through the repository', async () => {
    await useCase.execute(1n, 7, { estado: 'COMPLETADA' }, undefined);
    expect(orders.updateOperatorWorkOrder).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ estado: 'COMPLETADA' }),
    );
  });
});
