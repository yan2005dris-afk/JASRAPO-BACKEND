import { NotFoundException } from '@nestjs/common';
import { FindOnePaymentUseCase } from './find-one-payment.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { PaymentDetailEntity } from '../../domain/entities/payment-detail.entity';
import { SaldoFavorEntity } from '../../domain/entities/saldo-favor.entity';

describe('FindOnePaymentUseCase', () => {
  const repository = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;
  const useCase = new FindOnePaymentUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('should return payment when it exists', async () => {
    const mockPayment = new PaymentEntity({
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
      new PaymentEntity({
        pagoId: 1n,
        deletedAt: new Date('2026-06-18'),
      }),
    );
    await expect(useCase.execute(1n)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should return payment with full detail and saldos', async () => {
    const mockPayment = new PaymentEntity({
      pagoId: 1n,
      clienteId: 1n,
      deletedAt: null,
      estadoPago: 'REGISTRADO',
      detallePago: [
        new PaymentDetailEntity({
          detallePagoId: 10n,
          tipoPago: 'PAGO_LIBRE',
          montoAbonado: 100,
          formaPagoId: 1,
        }),
      ],
      saldosFavor: [
        new SaldoFavorEntity({
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
