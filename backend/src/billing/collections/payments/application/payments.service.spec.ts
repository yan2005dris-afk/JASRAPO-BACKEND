import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EstadoPago } from 'src/shared/enums';
import { PaymentsService } from './payments.service';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { CreateCobroPuntualUseCase } from './use-cases/create-cobro-puntual.use-case';
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './use-cases/apply-saldo-favor.use-case';
import { GetDailyCashSummaryUseCase } from './use-cases/get-daily-cash-summary.use-case';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import type { PaymentRow } from '../domain/types/payment.types';
import type { SaldoFavorRow } from '../domain/types/payment.types';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  paymentRow,
  paymentDetailRow,
  saldoFavorRow,
} from '../__test-utils__/payment-row.factory';

describe('PaymentsService', () => {
  let service: PaymentsService;
  const createUseCase = { execute: jest.fn() };
  const createCobroPuntualUseCase = { execute: jest.fn() };
  const findOneUseCase = { execute: jest.fn() };
  const validatePaymentUseCase = { execute: jest.fn() };
  const annulPaymentUseCase = { execute: jest.fn() };
  const applySaldoFavorUseCase = { execute: jest.fn() };
  const getDailyCashSummaryUseCase = { execute: jest.fn() };
  const storageService = { upload: jest.fn(), getUrl: jest.fn() };
  const paymentRepository = {
    paginate: jest.fn(),
    findSaldoFavorByCliente: jest.fn(),
    findDailyCashPayments: jest.fn(),
  };

  const mockPayment = paymentRow({
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
        {
          provide: CreateCobroPuntualUseCase,
          useValue: createCobroPuntualUseCase,
        },
        { provide: FindOnePaymentUseCase, useValue: findOneUseCase },
        { provide: ValidatePaymentUseCase, useValue: validatePaymentUseCase },
        { provide: AnnulPaymentUseCase, useValue: annulPaymentUseCase },
        { provide: ApplySaldoFavorUseCase, useValue: applySaldoFavorUseCase },
        {
          provide: GetDailyCashSummaryUseCase,
          useValue: getDailyCashSummaryUseCase,
        },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  it('should return payment states', async () => {
    await expect(service.findPaymentStates()).resolves.toContainEqual({
      codigo: EstadoPago.PENDIENTE,
    });
  });

  it('should delegate create and return PaymentRow', async () => {
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

  it('should delegate getDailyCashSummary to use case', async () => {
    const summary = {
      fecha: '2026-06-18',
      cajaId: null,
      totalPagos: 1,
      totalRecaudado: 150,
      desglosePorTipoDetalle: [{ codigo: 'EFECTIVO', total: 150 }],
      desglosePorTipoComprobante: [{ codigo: 'FACTURA', total: 150 }],
    };
    getDailyCashSummaryUseCase.execute.mockResolvedValue(summary);

    const result = await service.getDailyCashSummary({ fecha: '2026-06-18' });

    expect(result).toEqual(summary);
    expect(getDailyCashSummaryUseCase.execute).toHaveBeenCalledWith({
      fecha: '2026-06-18',
    });
  });

  it('should return available saldo favor for a client', async () => {
    const mockSaldo = saldoFavorRow({
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
