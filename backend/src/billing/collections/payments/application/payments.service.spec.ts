import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EstadoPago } from 'src/generated/prisma/enums';
import { PaymentsService } from './payments.service';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './use-cases/apply-saldo-favor.use-case';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import { PaymentEntity } from '../domain/entities/payment.entity';
import { SaldoFavorEntity } from '../domain/entities/saldo-favor.entity';
import { PaymentDetailEntity } from '../domain/entities/payment-detail.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;
  const createUseCase = { execute: jest.fn() };
  const findOneUseCase = { execute: jest.fn() };
  const validatePaymentUseCase = { execute: jest.fn() };
  const annulPaymentUseCase = { execute: jest.fn() };
  const applySaldoFavorUseCase = { execute: jest.fn() };
  const paymentRepository = {
    paginate: jest.fn(),
    findSaldoFavorByCliente: jest.fn(),
    findDailyCashPayments: jest.fn(),
  };

  const mockPayment = new PaymentEntity({
    pagoId: 1n,
    clienteId: 1n,
    cajaId: null,
    banco: null,
    comprobanteUrl: null,
    fechaPago: new Date('2026-06-18'),
    montoTotalRecibido: 10,
    numeroOperacion: null,
    observaciones: null,
    referenciaBanco: null,
    estadoPago: EstadoPago.PENDIENTE,
    creadoPor: 'tester',
    anuladoPor: null,
    fechaAnulacion: null,
    motivoAnulacion: null,
    createdAt: new Date('2026-06-18'),
    updatedAt: new Date('2026-06-18'),
    detallePago: [],
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentRepository, useValue: paymentRepository },
        { provide: CreatePaymentUseCase, useValue: createUseCase },
        { provide: FindOnePaymentUseCase, useValue: findOneUseCase },
        { provide: ValidatePaymentUseCase, useValue: validatePaymentUseCase },
        { provide: AnnulPaymentUseCase, useValue: annulPaymentUseCase },
        { provide: ApplySaldoFavorUseCase, useValue: applySaldoFavorUseCase },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  it('should return payment states', async () => {
    await expect(service.findPaymentStates()).resolves.toContainEqual({
      codigo: EstadoPago.PENDIENTE,
    });
  });

  it('should delegate create and return PaymentEntity', async () => {
    createUseCase.execute.mockResolvedValue(mockPayment);

    const result = await service.create(
      {
        clienteId: '1',
        fechaPago: '2026-06-18',
        montoTotalRecibido: 10,
        detalle: [{ tipoPago: 'PAGO_LIBRE', montoAbonado: 10, formaPagoId: 1 }],
      },
      'tester',
    );

    expect(createUseCase.execute).toHaveBeenCalled();
    expect(result).toBe(mockPayment);
  });

  it('should delegate findAll to repository paginate', async () => {
    const paginated = {
      data: [mockPayment],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
      },
    };
    paymentRepository.paginate.mockResolvedValue(paginated);

    const result = await service.findAll({
      fechaDesde: '2026-06-01',
      fechaHasta: '2026-06-30',
      pagination: { page: 1, limit: 10 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].pagoId).toBe(1n);
    expect(paymentRepository.paginate).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      expect.objectContaining({
        fechaDesde: '2026-06-01',
        fechaHasta: '2026-06-30',
      }),
    );
  });

  it('should return daily cash summary with correct totals and breakdowns', async () => {
    paymentRepository.findDailyCashPayments.mockResolvedValue([
      new PaymentEntity({
        pagoId: 1n,
        montoTotalRecibido: 150,
        fechaPago: new Date('2026-06-18'),
        detallePago: [
          new PaymentDetailEntity({
            tipoPago: 'EFECTIVO',
            montoAbonado: 100,
            comprobante: { comprobanteId: '1', tipoComprobante: 'FACTURA' },
          }),
          new PaymentDetailEntity({
            tipoPago: 'TRANSFERENCIA',
            montoAbonado: 50,
            comprobante: { comprobanteId: '2', tipoComprobante: 'FACTURA' },
          }),
        ],
      }),
    ]);

    const result = await service.getDailyCashSummary({ fecha: '2026-06-18' });

    expect(result.totalPagos).toBe(1);
    expect(result.totalRecaudado).toBe(150);
    expect(result.desglosePorTipoDetalle).toEqual(
      expect.arrayContaining([
        { codigo: 'EFECTIVO', total: 100 },
        { codigo: 'TRANSFERENCIA', total: 50 },
      ]),
    );
    expect(result.desglosePorTipoComprobante).toEqual(
      expect.arrayContaining([{ codigo: 'FACTURA', total: 150 }]),
    );
  });

  it('should filter daily cash summary by cajaId', async () => {
    paymentRepository.findDailyCashPayments.mockResolvedValue([]);

    const result = await service.getDailyCashSummary({
      fecha: '2026-06-18',
      cajaId: '5',
    });

    expect(result.cajaId).toBe('5');
    expect(result.totalPagos).toBe(0);
    expect(result.totalRecaudado).toBe(0);
    expect(paymentRepository.findDailyCashPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        cajaId: 5n,
      }),
    );
  });

  it('should return available saldo favor for a client', async () => {
    const mockSaldo = new SaldoFavorEntity({
      saldoFavorId: 1n,
      clienteId: 1n,
      pagoId: null,
      montoSaldo: 50,
      tipoOrigen: 'PAGO_EXCESO',
      disponibleParaAplicar: true,
      createdAt: new Date('2026-06-18'),
    });
    paymentRepository.findSaldoFavorByCliente.mockResolvedValue([mockSaldo]);

    const result = await service.findSaldoFavorByCliente(1n);

    expect(result).toHaveLength(1);
    expect(result[0].clienteId).toBe(1n);
    expect(result[0].montoSaldo).toBe(50);
    expect(paymentRepository.findSaldoFavorByCliente).toHaveBeenCalledWith(1n);
  });
});
