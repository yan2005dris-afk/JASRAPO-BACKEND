import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoCaja, TipoDetallePago } from 'src/generated/prisma/enums';
import { CreatePaymentUseCase } from './create-payment.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';

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
  const eventosRepository = {
    createPending: jest.fn(),
  } as unknown as jest.Mocked<EventosPendientesRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreatePaymentUseCase(repository, eventosRepository);
  });

  it('should reject when customer does not exist', async () => {
    repository.findUniqueCliente.mockResolvedValue(null);

    await expect(
      useCase.execute({
        clienteId: '1',
        fechaPago: '2026-06-18',
        montoTotalRecibido: 10,
        detalle: [
          {
            tipoPago: TipoDetallePago.PAGO_LIBRE,
            montoAbonado: 10,
            formaPagoId: 1,
          },
        ],
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
        detalle: [
          {
            tipoPago: TipoDetallePago.PAGO_LIBRE,
            montoAbonado: 10,
            formaPagoId: 1,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should create a payment in a transaction', async () => {
    repository.findUniqueCliente.mockResolvedValue({ clienteId: 1n });
    repository.findFirstCajaSesion.mockResolvedValue({
      cajaId: 1n,
      estado: EstadoCaja.ABIERTA,
    });
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
        detalle: [
          {
            tipoPago: TipoDetallePago.PAGO_LIBRE,
            montoAbonado: 10,
            formaPagoId: 1,
          },
        ],
      }),
    ).resolves.toEqual({ pagoId: 10n });
  });

  // ─── T-G2c: cuota.pagada outbox emission ─────────────────────────────

  it('should emit cuota.pagada when a cuota becomes fully paid', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findUniqueCliente.mockResolvedValue({ clienteId: 1n });
      repository.createPago.mockResolvedValue({ pagoId: 10n });
      repository.createManyDetallePago.mockResolvedValue(undefined);
      repository.findUniqueCuotaConvenio.mockResolvedValue({
        cuotaConvenioId: 5n,
        convenioId: 1n,
        montoPagado: 0,
        saldoPendiente: 100,
        estado: 'PENDIENTE',
        deletedAt: null,
      });
      repository.updateCuotaConvenio.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findUniquePago.mockResolvedValue({ pagoId: 10n });

    await useCase.execute({
      clienteId: '1',
      fechaPago: '2026-06-18',
      montoTotalRecibido: 100,
      detalle: [
        {
          tipoPago: TipoDetallePago.CUOTA_CONVENIO,
          cuotaConvenioId: '5',
          montoAbonado: 100,
          formaPagoId: 1,
        },
      ],
    });

    expect(eventosRepository.createPending).toHaveBeenCalledWith(
      'cuota.pagada',
      {
        cuotaConvenioId: '5',
        pagoId: '10',
        convenioId: expect.any(String),
      },
      'CUOTA_CONVENIO',
      '5',
      tx,
    );
  });
});
