import { BadRequestException } from '@nestjs/common';
import { EstadoPago } from '../../domain/enums';
import { ValidatePaymentUseCase } from './validate-payment.use-case';

describe('ValidatePaymentUseCase', () => {
  const repository = {
    updateManyPagos: jest.fn(),
    updatePago: jest.fn(),
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
    repository.updatePago.mockResolvedValue({ pagoId: 1n });
    useCase = new ValidatePaymentUseCase(
      repository as any,
      eventosPendientesRepository as any,
      findOne as any,
      annul as any,
    );
  });

  // ─── Existing tests (preserved) ───

  it('should allow PENDIENTE to REGISTRADO', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 1n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.updatePago.mockResolvedValue({ pagoId: 1n });
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
      estadoPago: EstadoPago.PENDIENTE,
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

    expect(annul.execute).toHaveBeenCalledWith(1n, {
      motivoAnulacion: 'error',
      anuladoPor: 'admin',
    });
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
        'cajero-1',
      ),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });

    expect(annul.execute).toHaveBeenCalledWith(1n, {
      motivoAnulacion: 'cancel',
      anuladoPor: 'cajero-1',
    });
  });

  // ─── W-3: outbox event tests (replacing T-005 in-process emission) ───

  it('should persist a pago.validado outbox row inside the same tx that updates the pago', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 7n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.updatePago.mockResolvedValue({ pagoId: 7n });
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
    repository.updatePago.mockResolvedValue({ pagoId: 42n });
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

  it('should ensure atomicity: if createPending throws inside the tx, the use case surfaces the error and the pago is NOT marked as updated', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 99n,
      estadoPago: EstadoPago.PENDIENTE,
    });
    repository.executeTransaction.mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    );
    repository.updatePago.mockResolvedValue({ pagoId: 99n });
    eventosPendientesRepository.createPending.mockRejectedValue(
      new Error('outbox-unavailable'),
    );

    await expect(
      useCase.execute(99n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toThrow('outbox-unavailable');

    expect(repository.updatePago).toHaveBeenCalledTimes(1);
    expect(eventosPendientesRepository.createPending).toHaveBeenCalledTimes(1);
  });

  it('should call updatePago and createPending with the SAME tx client so the tx wraps both writes', async () => {
    findOne.execute.mockResolvedValue({
      pagoId: 5n,
      estadoPago: EstadoPago.PENDIENTE,
    });

    const txMarker = Symbol('tx');
    const tx = { txMarker };
    let observedTxForUpdate: unknown = null;
    let observedTxForOutbox: unknown = null;
    repository.executeTransaction.mockImplementationOnce(async (cb) => {
      return cb(tx);
    });
    repository.updatePago.mockImplementationOnce(async (_w, _d, _s, t) => {
      observedTxForUpdate = t;
      return { pagoId: 5n };
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
    expect(observedTxForOutbox).toBe(observedTxForUpdate);
  });
});
