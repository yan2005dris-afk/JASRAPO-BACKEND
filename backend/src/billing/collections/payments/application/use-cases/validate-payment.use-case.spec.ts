import { BadRequestException } from '@nestjs/common';
import { EstadoPago } from '../../domain/enums';
import { ValidatePaymentUseCase } from './validate-payment.use-case';
import { PaymentRow } from '../../domain/types/payment.types';
import {
  paymentRow,
  paymentDetailRow,
  saldoFavorRow,
} from '../../__test-utils__/payment-row.factory';

describe('ValidatePaymentUseCase', () => {
  const repository = {
    updatePagoState: jest.fn(),
    findById: jest.fn(),
    executeTransaction: jest.fn(),
  };
  const findOne = { execute: jest.fn() };
  const annul = { execute: jest.fn() };
  const eventosPendientesRepository = { createPending: jest.fn() };
  let useCase: ValidatePaymentUseCase;

  const mockPayment = paymentRow({
    pagoId: 1n,
    estadoPago: EstadoPago.PENDIENTE,
    clienteId: 10n,
    montoTotalRecibido: 50,
    fechaPago: new Date(),
    creadoPor: 'SYSTEM',
    createdAt: new Date(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    repository.executeTransaction.mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    );
    repository.updatePagoState.mockResolvedValue(undefined);
    useCase = new ValidatePaymentUseCase(
      repository as any,
      eventosPendientesRepository as any,
      findOne as any,
      annul as any,
    );
  });

  it('should allow PENDIENTE to REGISTRADO', async () => {
    findOne.execute.mockResolvedValue(mockPayment);
    const updatedPayment = paymentRow({
      ...mockPayment,
      estadoPago: EstadoPago.REGISTRADO,
    });
    repository.findById.mockResolvedValue(updatedPayment);
    eventosPendientesRepository.createPending.mockResolvedValue({ id: 1n });

    const result = await useCase.execute(1n, {
      estadoPago: EstadoPago.REGISTRADO,
    });

    expect(result.estadoPago).toBe(EstadoPago.REGISTRADO);
  });

  it('should reject invalid transition from ANULADO', async () => {
    findOne.execute.mockResolvedValue(
      paymentRow({ ...mockPayment, estadoPago: EstadoPago.ANULADO }),
    );

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should delegate annul transition', async () => {
    findOne.execute.mockResolvedValue(mockPayment);
    const annulledPayment = paymentRow({
      ...mockPayment,
      estadoPago: EstadoPago.ANULADO,
    });
    annul.execute.mockResolvedValue(annulledPayment);

    const result = await useCase.execute(
      1n,
      { estadoPago: EstadoPago.ANULADO, motivo: 'error' },
      'admin',
    );

    expect(result.estadoPago).toBe(EstadoPago.ANULADO);
    expect(annul.execute).toHaveBeenCalledWith(1n, {
      motivoAnulacion: 'error',
      anuladoPor: 'admin',
    });
  });

  it('should persist a pago.validado outbox row inside the same tx that updates the pago', async () => {
    findOne.execute.mockResolvedValue(
      paymentRow({ ...mockPayment, pagoId: 7n }),
    );
    repository.findById.mockResolvedValue(
      paymentRow({
        ...mockPayment,
        pagoId: 7n,
        estadoPago: EstadoPago.REGISTRADO,
      }),
    );
    eventosPendientesRepository.createPending.mockResolvedValue({ id: 1n });

    await useCase.execute(7n, { estadoPago: EstadoPago.REGISTRADO }, 'sys');

    expect(eventosPendientesRepository.createPending).toHaveBeenCalledWith(
      'pago.validado',
      { pagoId: '7', estadoPago: EstadoPago.REGISTRADO, actualizadoPor: 'sys' },
      'PAGO',
      '7',
      expect.objectContaining({}),
    );
  });

  it('should ensure atomicity: if createPending throws inside the tx, the use case surfaces the error', async () => {
    findOne.execute.mockResolvedValue(
      paymentRow({ ...mockPayment, pagoId: 99n }),
    );
    repository.executeTransaction.mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    );
    eventosPendientesRepository.createPending.mockRejectedValue(
      new Error('outbox-unavailable'),
    );

    await expect(
      useCase.execute(99n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toThrow('outbox-unavailable');

    expect(repository.updatePagoState).toHaveBeenCalledTimes(1);
    expect(eventosPendientesRepository.createPending).toHaveBeenCalledTimes(1);
  });
});
