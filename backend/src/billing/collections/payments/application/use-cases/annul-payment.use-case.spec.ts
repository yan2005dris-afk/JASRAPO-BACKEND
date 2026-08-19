import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoPago } from 'src/generated/prisma/enums';
import { AnnulPaymentUseCase } from './annul-payment.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { PaymentDetailEntity } from '../../domain/entities/payment-detail.entity';

describe('AnnulPaymentUseCase', () => {
  const repository = {
    findById: jest.fn(),
    executeTransaction: jest.fn(),
    updateManySaldoFavorByPagoId: jest.fn(),
    updateManyDetallePagoByPagoId: jest.fn(),
    findCuotaConvenioById: jest.fn(),
    updateCuotaConvenioRevert: jest.fn(),
    annulPagoTransaction: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;

  const outboxRepo = {
    createPending: jest.fn().mockResolvedValue({}),
  } as unknown as jest.Mocked<EventosPendientesRepository>;

  const useCase = new AnnulPaymentUseCase(repository, outboxRepo);

  beforeEach(() => jest.clearAllMocks());

  it('should require reason', async () => {
    await expect(
      useCase.execute(1n, { motivoAnulacion: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw when payment does not exist', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findById.mockResolvedValueOnce(null);
      return cb(tx);
    });
    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should annul pending payment', async () => {
    const pendingPayment = new PaymentEntity({
      pagoId: 1n,
      estadoPago: EstadoPago.PENDIENTE,
      deletedAt: null,
      detallePago: [],
    });
    const annulledPayment = new PaymentEntity({
      pagoId: 1n,
      estadoPago: EstadoPago.ANULADO,
    });

    repository.findById
      .mockResolvedValueOnce(pendingPayment)
      .mockResolvedValueOnce(annulledPayment);

    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.updateManySaldoFavorByPagoId.mockResolvedValue(undefined);
      repository.updateManyDetallePagoByPagoId.mockResolvedValue(undefined);
      repository.annulPagoTransaction.mockResolvedValue({ count: 1 });
      return cb(tx);
    });

    const result = await useCase.execute(1n, {
      motivoAnulacion: 'error',
      anuladoPor: 'admin',
    });

    expect(result.estadoPago).toBe(EstadoPago.ANULADO);
  });

  it('should revert CUOTA_CONVENIO installment when annulling', async () => {
    const registeredPayment = new PaymentEntity({
      pagoId: 1n,
      estadoPago: EstadoPago.REGISTRADO,
      deletedAt: null,
      detallePago: [
        new PaymentDetailEntity({
          tipoPago: 'CUOTA_CONVENIO',
          montoAbonado: 50,
          cuotaConvenioId: 99n,
        }),
      ],
    });
    const annulledPayment = new PaymentEntity({
      pagoId: 1n,
      estadoPago: EstadoPago.ANULADO,
    });

    repository.findById
      .mockResolvedValueOnce(registeredPayment)
      .mockResolvedValueOnce(annulledPayment);

    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findCuotaConvenioById.mockResolvedValue({
        cuotaConvenioId: 99n,
        convenioId: 1n,
        estado: 'PENDIENTE',
        montoPagado: 50,
        saldoPendiente: 100,
        deletedAt: null,
      });
      repository.updateCuotaConvenioRevert.mockResolvedValue(undefined);
      repository.updateManySaldoFavorByPagoId.mockResolvedValue(undefined);
      repository.updateManyDetallePagoByPagoId.mockResolvedValue(undefined);
      repository.annulPagoTransaction.mockResolvedValue({ count: 1 });
      return cb(tx);
    });

    const result = await useCase.execute(1n, { motivoAnulacion: 'error' });

    expect(result.estadoPago).toBe(EstadoPago.ANULADO);
    expect(repository.findCuotaConvenioById).toHaveBeenCalledWith(
      99n,
      expect.any(Symbol),
    );
    expect(repository.updateCuotaConvenioRevert).toHaveBeenCalled();
  });

  it('should throw BadRequestException when payment is already ANULADO', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findById.mockResolvedValueOnce(
        new PaymentEntity({
          pagoId: 1n,
          estadoPago: EstadoPago.ANULADO,
          deletedAt: null,
          detallePago: [],
        }),
      );
      return cb(tx);
    });

    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw BadRequestException on concurrent modification (count = 0)', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findById.mockResolvedValueOnce(
        new PaymentEntity({
          pagoId: 1n,
          estadoPago: EstadoPago.PENDIENTE,
          deletedAt: null,
          detallePago: [],
        }),
      );
      repository.updateManySaldoFavorByPagoId.mockResolvedValue(undefined);
      repository.updateManyDetallePagoByPagoId.mockResolvedValue(undefined);
      repository.annulPagoTransaction.mockResolvedValue({ count: 0 });
      return cb(tx);
    });

    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
