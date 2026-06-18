import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoPago } from 'src/generated/prisma/enums';
import { AnnulPaymentUseCase } from './annul-payment.use-case';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

describe('AnnulPaymentUseCase', () => {
  const repository = {
    findUniquePago: jest.fn(),
    executeTransaction: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;
  const useCase = new AnnulPaymentUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('should require reason', async () => {
    await expect(
      useCase.execute(1n, { motivoAnulacion: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw when payment does not exist', async () => {
    repository.findUniquePago.mockResolvedValue(null);
    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should annul pending payment', async () => {
    repository.findUniquePago
      .mockResolvedValueOnce({ pagoId: 1n, estadoPago: EstadoPago.PENDIENTE, deletedAt: null, detallePago: [] })
      .mockResolvedValueOnce({ pagoId: 1n, estadoPago: EstadoPago.ANULADO });
    repository.executeTransaction.mockImplementation(async (cb: any) =>
      cb({
        saldoFavorCliente: { updateMany: jest.fn() },
        detallePago: { updateMany: jest.fn() },
        pagos: { update: jest.fn() },
      }),
    );

    await expect(
      useCase.execute(1n, { motivoAnulacion: 'error', anuladoPor: 'admin' }),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });
  });
});
