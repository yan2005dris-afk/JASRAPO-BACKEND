import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TipoDetallePago } from 'src/generated/prisma/enums';
import { CreatePaymentUseCase } from './create-payment.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  const repository = {
    clientExists: jest.fn(),
    isCajaOpen: jest.fn(),
    executeTransaction: jest.fn(),
    createPagoRecord: jest.fn(),
    createDetallesPago: jest.fn(),
    createSaldoFavorRecord: jest.fn(),
    findComprobanteById: jest.fn(),
    findComprobanteAppliedSum: jest.fn(),
    findCuotaConvenioById: jest.fn(),
    updateCuotaConvenioPayment: jest.fn(),
    findById: jest.fn(),
    lockComprobante: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;

  const eventosRepository = {
    createPending: jest.fn(),
  } as unknown as jest.Mocked<EventosPendientesRepository>;

  const mockCreatedPayment = new PaymentEntity({
    pagoId: 10n,
    clienteId: 1n,
    montoTotalRecibido: 10,
    fechaPago: new Date('2026-06-18'),
    estadoPago: 'PENDIENTE',
    creadoPor: 'SYSTEM',
    createdAt: new Date(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreatePaymentUseCase(repository, eventosRepository);
  });

  it('should reject when customer does not exist', async () => {
    repository.clientExists.mockResolvedValue(false);

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
    repository.clientExists.mockResolvedValue(true);

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
    repository.clientExists.mockResolvedValue(true);
    repository.isCajaOpen.mockResolvedValue(true);
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.createPagoRecord.mockResolvedValue({ pagoId: 10n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockCreatedPayment);

    const result = await useCase.execute({
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
    });

    expect(result).toBe(mockCreatedPayment);
  });

  it('R-B.1: should lock comprobante row before checking balance for COMPROBANTE type', async () => {
    repository.clientExists.mockResolvedValue(true);
    repository.isCajaOpen.mockResolvedValue(true);
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.lockComprobante.mockResolvedValue(undefined);
      repository.findComprobanteById.mockResolvedValue({
        id: 100n,
        importeTotal: 50,
      });
      repository.findComprobanteAppliedSum.mockResolvedValue(0);
      repository.createPagoRecord.mockResolvedValue({ pagoId: 10n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockCreatedPayment);

    await useCase.execute({
      clienteId: '1',
      cajaId: '1',
      fechaPago: '2026-06-18',
      montoTotalRecibido: 50,
      detalle: [
        {
          tipoPago: TipoDetallePago.COMPROBANTE,
          comprobanteId: '100',
          montoAbonado: 50,
          formaPagoId: 1,
        },
      ],
    });

    expect(repository.lockComprobante).toHaveBeenCalled();
    expect(repository.lockComprobante.mock.calls[0][0]).toBe(100n);
    const lockOrder = repository.lockComprobante.mock.invocationCallOrder[0];
    const findOrder =
      repository.findComprobanteById.mock.invocationCallOrder[0];
    expect(lockOrder).toBeLessThan(findOrder);
  });

  it('R-B.1: should NOT lock comprobante for CUOTA_CONVENIO type details', async () => {
    repository.clientExists.mockResolvedValue(true);
    repository.isCajaOpen.mockResolvedValue(true);
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      const tx = Symbol('tx') as any;
      repository.findCuotaConvenioById.mockResolvedValue({
        cuotaConvenioId: 5n,
        estado: 'PENDIENTE',
        deletedAt: null,
        saldoPendiente: 50,
        montoPagado: 0,
        convenioId: 1n,
      });
      repository.updateCuotaConvenioPayment.mockResolvedValue({ count: 1 });
      repository.createPagoRecord.mockResolvedValue({ pagoId: 10n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockCreatedPayment);

    await useCase.execute({
      clienteId: '1',
      cajaId: '1',
      fechaPago: '2026-06-18',
      montoTotalRecibido: 50,
      detalle: [
        {
          tipoPago: TipoDetallePago.CUOTA_CONVENIO,
          cuotaConvenioId: '5',
          montoAbonado: 50,
          formaPagoId: 1,
        },
      ],
    });

    expect(repository.lockComprobante).not.toHaveBeenCalled();
  });

  it('should emit cuota.pagada when a cuota becomes fully paid', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.clientExists.mockResolvedValue(true);
      repository.createPagoRecord.mockResolvedValue({ pagoId: 10n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      repository.findCuotaConvenioById.mockResolvedValue({
        cuotaConvenioId: 5n,
        convenioId: 1n,
        montoPagado: 0,
        saldoPendiente: 100,
        estado: 'PENDIENTE',
        deletedAt: null,
      });
      repository.updateCuotaConvenioPayment.mockResolvedValue({ count: 1 });
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockCreatedPayment);

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
        convenioId: '1',
      },
      'CUOTA_CONVENIO',
      '5',
      tx,
    );
  });
});
