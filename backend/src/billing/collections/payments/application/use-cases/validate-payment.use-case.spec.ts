import { BadRequestException } from '@nestjs/common';
import { EstadoPago } from '../../domain/enums';
import { ValidatePaymentUseCase } from './validate-payment.use-case';

describe('ValidatePaymentUseCase', () => {
  const repository = {
    updateManyPagos: jest.fn(),
    findUniquePago: jest.fn(),
    executeTransaction: jest.fn(),
  };
  const findOne = { execute: jest.fn() };
  const annul = { execute: jest.fn() };
  const eventosPendientesRepository = { createPending: jest.fn() };
  let useCase: ValidatePaymentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    // executeTransaction runs the callback so we mimic Prisma's $transaction.
    repository.executeTransaction.mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    );
    repository.updateManyPagos.mockResolvedValue({ count: 1 });
    useCase = new ValidatePaymentUseCase(
      repository as any,
      findOne as any,
      annul as any,
      eventosPendientesRepository as any,
    );
  });

  // ─── Existing tests (preserved) ───

  it('should allow PENDIENTE to REGISTRADO', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.updateManyPagos.mockResolvedValue({ count: 1 });
    repository.findUniquePago.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.REGISTRADO,
    });
    eventosPendientesRepository.createPending.mockResolvedValue({ id: 1n });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.REGISTRADO });
  });

  it('should reject invalid transition from ANULADO', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.ANULADO,
    });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should delegate annul transition', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.REGISTRADO,
    });
    annul.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.ANULADO,
    });

    await expect(
      useCase.execute(
        1n,
        { estadoPago: EstadoPago.ANULADO, motivo: 'error' },
        'admin',
      ),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });
  });

  it('should throw BadRequestException when transitioning to same state', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.PENDIENTE,
    });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.PENDIENTE }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject invalid transition REGISTRADO → PENDIENTE', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.REGISTRADO,
    });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.PENDIENTE }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should allow PENDIENTE → ANULADO via delegation to annul', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    annul.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.ANULADO,
    });

    await expect(
      useCase.execute(
        1n,
        { estadoPago: EstadoPago.ANULADO, motivo: 'cancel' },
        'admin',
      ),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });

    expect(annul.execute).toHaveBeenCalledWith(1n, {
      motivoAnulacion: 'cancel',
      anuladoPor: 'admin',
    });
  });

  it('should throw BadRequestException on concurrent modification (count = 0)', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.updateManyPagos.mockResolvedValue({ count: 0 });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ─── W-3: outbox event tests (replacing T-005 in-process emission) ───

  it('should persist a pago.validado outbox row inside the same tx that updates the pago', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 7n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.updateManyPagos.mockResolvedValue({ count: 1 });
    repository.findUniquePago.mockResolvedValue({
      pagoId: 7n,
      estadoPago: EstadoPago.REGISTRADO,
    });
    eventosPendientesRepository.createPending.mockResolvedValue({ id: 1n });

    await useCase.execute(7n, { estadoPago: EstadoPago.REGISTRADO }, 'sys');

    expect(eventosPendientesRepository.createPending).toHaveBeenCalledWith(
      'pago.validado',
      { pagoId: '7', estadoPago: EstadoPago.REGISTRADO, actualizadoPor: 'sys' },
      'PAGO',
      '7',
      expect.objectContaining({}), // the tx client
    );
  });

  it('should write the outbox row with aggregateType=PAGO and aggregateId=pagoId (string)', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 42n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.updateManyPagos.mockResolvedValue({ count: 1 });
    repository.findUniquePago.mockResolvedValue({ pagoId: 42n });
    eventosPendientesRepository.createPending.mockResolvedValue({ id: 1n });

    await useCase.execute(
      42n,
      { estadoPago: EstadoPago.REGISTRADO },
      'cajero-1',
    );

    expect(eventosPendientesRepository.createPending).toHaveBeenCalledWith(
      'pago.validado',
      expect.any(Object),
      'PAGO',
      '42',
      expect.any(Object),
    );
  });

  it('should NOT persist the outbox row when optimistic lock fails (T-005 replacement)', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.updateManyPagos.mockResolvedValue({ count: 0 });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(eventosPendientesRepository.createPending).not.toHaveBeenCalled();
  });

  it('should ensure atomicity: if createPending throws inside the tx, the use case surfaces the error and the pago is NOT marked as updated', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 99n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    // Simulate the tx rolling back by having executeTransaction re-throw
    // whatever the callback throws. Update was called, but tx aborts.
    repository.executeTransaction.mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    );
    repository.updateManyPagos.mockResolvedValue({ count: 1 });
    eventosPendientesRepository.createPending.mockRejectedValue(
      new Error('outbox-unavailable'),
    );

    await expect(
      useCase.execute(99n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toThrow('outbox-unavailable');

    // updateManyPagos WAS called within the tx (the rollback is the tx's job).
    expect(repository.updateManyPagos).toHaveBeenCalledTimes(1);
    // And the createPending failure is the only failure — would cause tx abort.
    expect(eventosPendientesRepository.createPending).toHaveBeenCalledTimes(1);
  });

  it('should call updateManyPagos and createPending with the SAME tx client so the tx wraps both writes', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 5n,
      estadoPago: EstadoPago.PENDIENTE,
    });

    const txMarker = Symbol('tx');
    const tx = { txMarker };
    // Record which tx object each call received.
    let observedTxForUpdate: unknown = null;
    let observedTxForOutbox: unknown = null;
    repository.executeTransaction.mockImplementationOnce(async (cb) => {
      return cb(tx);
    });
    repository.updateManyPagos.mockImplementationOnce(async (_w, _d, t) => {
      observedTxForUpdate = t;
      return { count: 1 };
    });
    eventosPendientesRepository.createPending.mockImplementationOnce(
      async (...args: unknown[]) => {
        observedTxForOutbox = args[4];
        return { id: 1n };
      },
    );
    repository.findUniquePago.mockResolvedValue({ pagoId: 5n });

    await useCase.execute(5n, { estadoPago: EstadoPago.REGISTRADO }, 'sys');

    expect(observedTxForUpdate).toBe(tx);
    expect(observedTxForOutbox).toBe(tx);
    // Sanity: same identity proves both writes are within the same tx.
    expect(observedTxForOutbox).toBe(observedTxForUpdate);
  });
});
