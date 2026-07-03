import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoCaja, TipoDetallePago } from 'src/generated/prisma/enums';
import { CreatePaymentUseCase } from './create-payment.use-case';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  const repository = {
    findUniqueCliente: jest.fn(),
    findFirstCajaSesion: jest.fn(),
    executeTransaction: jest.fn(),
    createPago: jest.fn(),
    createManyDetallePago: jest.fn(),
    createSaldoFavor: jest.fn(),
    findUniqueComprobante: jest.fn(),
    findManyDetallePago: jest.fn(),
    findUniqueCuotaConvenio: jest.fn(),
    updateCuotaConvenio: jest.fn(),
    findUniquePago: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreatePaymentUseCase(repository);
  });

  it('should reject when customer does not exist', async () => {
    repository.findUniqueCliente.mockResolvedValue(null);

    await expect(
      useCase.execute({
        clienteId: '1',
        fechaPago: '2026-06-18',
        montoTotalRecibido: 10,
        detalle: [{ tipoPago: TipoDetallePago.PAGO_LIBRE, montoAbonado: 10, formaPagoId: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject when total does not match details', async () => {
    repository.findUniqueCliente.mockResolvedValue({ clienteId: 1n });

    await expect(
      useCase.execute({
        clienteId: '1',
        fechaPago: '2026-06-18',
        montoTotalRecibido: 11,
        detalle: [{ tipoPago: TipoDetallePago.PAGO_LIBRE, montoAbonado: 10, formaPagoId: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should create a payment in a transaction', async () => {
    repository.findUniqueCliente.mockResolvedValue({ clienteId: 1n });
    repository.findFirstCajaSesion.mockResolvedValue({ cajaId: 1n, estado: EstadoCaja.ABIERTA });
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.createPago.mockResolvedValue({ pagoId: 10n });
      repository.createManyDetallePago.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findUniquePago.mockResolvedValue({ pagoId: 10n });

    await expect(
      useCase.execute({
        clienteId: '1',
        cajaId: '1',
        fechaPago: '2026-06-18',
        montoTotalRecibido: 10,
        detalle: [{ tipoPago: TipoDetallePago.PAGO_LIBRE, montoAbonado: 10, formaPagoId: 1 }],
      }),
    ).resolves.toEqual({ pagoId: 10n });
  });
});
