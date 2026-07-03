import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoPago } from 'src/generated/prisma/enums';
import { AnnulPaymentUseCase } from './annul-payment.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';

describe('AnnulPaymentUseCase', () => {
  const repository = {
    findUniquePago: jest.fn(),
    executeTransaction: jest.fn(),
    updateManySaldoFavor: jest.fn(),
    updateManyDetallePago: jest.fn(),
    updatePago: jest.fn(),
    findUniqueCuotaConvenio: jest.fn(),
    updateCuotaConvenio: jest.fn(),
    updateManyPagos: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;
  const useCase = new AnnulPaymentUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('should require reason', async () => {
    await expect(
      useCase.execute(1n, { motivoAnulacion: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw when payment does not exist', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findUniquePago.mockResolvedValueOnce(null);
      return cb(tx);
    });
    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should annul pending payment', async () => {
    repository.findUniquePago
      .mockResolvedValueOnce({
        pagoId: 1n,
        estadoPago: EstadoPago.PENDIENTE,
        deletedAt: null,
        detallePago: [],
      })
      .mockResolvedValueOnce({ pagoId: 1n, estadoPago: EstadoPago.ANULADO });
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.updateManySaldoFavor.mockResolvedValue(undefined);
      repository.updateManyDetallePago.mockResolvedValue(undefined);
      repository.updateManyPagos.mockResolvedValue({ count: 1 });
      return cb(tx);
    });

    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error', anuladoPor: 'admin' }),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });
  });

  it('should revert CUOTA_CONVENIO installment when annulling', async () => {
    repository.findUniquePago
      .mockResolvedValueOnce({
        pagoId: 1n,
        estadoPago: EstadoPago.REGISTRADO,
        deletedAt: null,
        detallePago: [
          { tipoPago: 'CUOTA_CONVENIO', montoAbonado: 50, cuotaConvenioId: 99n },
        ],
      })
      .mockResolvedValueOnce({ pagoId: 1n, estadoPago: EstadoPago.ANULADO });
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findUniqueCuotaConvenio.mockResolvedValue({
        cuotaConvenioId: 99n,
        montoPagado: 50,
        saldoPendiente: 100,
      });
      repository.updateCuotaConvenio.mockResolvedValue(undefined);
      repository.updateManySaldoFavor.mockResolvedValue(undefined);
      repository.updateManyDetallePago.mockResolvedValue(undefined);
      repository.updateManyPagos.mockResolvedValue({ count: 1 });
      return cb(tx);
    });

    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });

    expect(repository.findUniqueCuotaConvenio).toHaveBeenCalledWith(
      { cuotaConvenioId: 99n },
      expect.any(Object),
      expect.any(Symbol),
    );
    expect(repository.updateCuotaConvenio).toHaveBeenCalled();
  });

  it('should throw BadRequestException when payment is already ANULADO', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findUniquePago.mockResolvedValueOnce({
        pagoId: 1n,
        estadoPago: EstadoPago.ANULADO,
        deletedAt: null,
        detallePago: [],
      });
      return cb(tx);
    });

    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw BadRequestException on concurrent modification (count = 0)', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findUniquePago.mockResolvedValueOnce({
        pagoId: 1n,
        estadoPago: EstadoPago.PENDIENTE,
        deletedAt: null,
        detallePago: [],
      });
      repository.updateManySaldoFavor.mockResolvedValue(undefined);
      repository.updateManyDetallePago.mockResolvedValue(undefined);
      repository.updateManyPagos.mockResolvedValue({ count: 0 });
      return cb(tx);
    });

    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.updateManyPagos).toHaveBeenCalledWith(
      expect.objectContaining({ pagoId: 1n }),
      expect.any(Object),
      expect.any(Symbol),
    );
  });
});
