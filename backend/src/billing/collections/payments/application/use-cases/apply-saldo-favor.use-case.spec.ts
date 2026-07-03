import { BadRequestException } from '@nestjs/common';
import { ApplySaldoFavorUseCase } from './apply-saldo-favor.use-case';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

describe('ApplySaldoFavorUseCase', () => {
  const repository = {
    executeTransaction: jest.fn(),
    findUniquePago: jest.fn(),
    findUniqueSaldoFavor: jest.fn(),
    findUniqueComprobante: jest.fn(),
    findUniqueCuotaConvenio: jest.fn(),
    updateCuotaConvenio: jest.fn(),
    createPago: jest.fn(),
    createDetallePago: jest.fn(),
    updateSaldoFavor: jest.fn(),
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

  it('should reject when both destinations are provided', async () => {
    await expect(
      useCase.execute({
        saldoFavorId: '1',
        clienteId: '1',
        montoAplicar: 10,
        comprobanteId: '1',
        cuotaConvenioId: '3',
        formaPagoId: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject negative or zero montoAplicar', async () => {
    await expect(
      useCase.execute({
        saldoFavorId: '1',
        clienteId: '1',
        montoAplicar: 0,
        comprobanteId: '1',
        formaPagoId: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      useCase.execute({
        saldoFavorId: '1',
        clienteId: '1',
        montoAplicar: -5,
        comprobanteId: '1',
        formaPagoId: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should apply available balance to comprobante', async () => {
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findUniqueSaldoFavor.mockResolvedValue({
        saldoFavorId: 1n,
        clienteId: 1n,
        montoSaldo: 10,
        disponibleParaAplicar: true,
        deletedAt: null,
      });
      repository.findUniqueComprobante.mockResolvedValue({ id: 1n, importeTotal: 100 });
      repository.createPago.mockResolvedValue({ pagoId: 2n });
      repository.createDetallePago.mockResolvedValue(undefined);
      repository.updateSaldoFavor.mockResolvedValue(undefined);
      return cb(tx);
    });
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
