import { BadRequestException } from '@nestjs/common';
import { ApplySaldoFavorUseCase } from './apply-saldo-favor.use-case';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

describe('ApplySaldoFavorUseCase', () => {
  const repository = {
    executeTransaction: jest.fn(),
    findUniquePago: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;
  const useCase = new ApplySaldoFavorUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('should require a destination', async () => {
    await expect(
      useCase.execute({
        saldoFavorId: '1',
        clienteId: '1',
        montoAplicar: 10,
        formaPagoId: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should apply available balance to comprobante', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) =>
      cb({
        saldoFavorCliente: {
          findUnique: jest.fn().mockResolvedValue({
            saldoFavorId: 1n,
            clienteId: 1n,
            montoSaldo: 10,
            disponibleParaAplicar: true,
            deletedAt: null,
          }),
          update: jest.fn(),
        },
        comprobantes: { findUnique: jest.fn().mockResolvedValue({ id: 1n }) },
        pagos: { create: jest.fn().mockResolvedValue({ pagoId: 2n }) },
        detallePago: { create: jest.fn() },
      }),
    );
    repository.findUniquePago.mockResolvedValue({ pagoId: 2n });

    await expect(
      useCase.execute({
        saldoFavorId: '1',
        clienteId: '1',
        montoAplicar: 10,
        comprobanteId: '1',
        formaPagoId: 1,
      }),
    ).resolves.toEqual({ pagoId: 2n });
  });
});
