import { NotFoundException } from '@nestjs/common';
import { FindOnePaymentUseCase } from './find-one-payment.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentRow } from '../../domain/types/payment.types';
import { PaymentDetailRow } from '../../domain/types/payment.types';
import { SaldoFavorRow } from '../../domain/types/payment.types';
import {
  paymentRow,
  paymentDetailRow,
  saldoFavorRow,
} from '../../__test-utils__/payment-row.factory';

describe('FindOnePaymentUseCase', () => {
  const repository = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;
  const useCase = new FindOnePaymentUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('should return payment when it exists', async () => {
    const mockPayment = paymentRow({
      pagoId: 1n,
      deletedAt: null,
    });
    repository.findById.mockResolvedValue(mockPayment);
    await expect(useCase.execute(1n)).resolves.toMatchObject({ pagoId: 1n });
  });

  it('should throw when payment does not exist', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw NotFoundException when payment has deletedAt set', async () => {
    repository.findById.mockResolvedValue(
      paymentRow({
        pagoId: 1n,
        deletedAt: new Date('2026-06-18'),
      }),
    );
    await expect(useCase.execute(1n)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should return payment with full detail and saldos', async () => {
    const mockPayment = paymentRow({
      pagoId: 1n,
      clienteId: 1n,
      deletedAt: null,
      estadoPago: 'REGISTRADO',
      detallePago: [
        paymentDetailRow({
          detallePagoId: 10n,
          tipoPago: 'PAGO_LIBRE',
          montoAbonado: 100,
          formaPagoId: 1,
        }),
      ],
      saldosFavor: [
        saldoFavorRow({
          saldoFavorId: 20n,
          montoSaldo: 50,
        }),
      ],
    });
    repository.findById.mockResolvedValue(mockPayment);

    const result = await useCase.execute(1n);

    expect(result).toMatchObject({
      pagoId: 1n,
      detallePago: expect.arrayContaining([
        expect.objectContaining({ detallePagoId: 10n }),
      ]),
      saldosFavor: expect.arrayContaining([
        expect.objectContaining({ saldoFavorId: 20n }),
      ]),
    });
  });
});
