import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EstadoPago } from 'src/shared/enums';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../../application/payments.service';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';
import { PaymentRow } from '../../domain/types/payment.types';
import { SaldoFavorRow } from '../../domain/types/payment.types';
import {
  paymentRow,
  paymentDetailRow,
  saldoFavorRow,
} from '../../__test-utils__/payment-row.factory';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  const service = {
    create: jest.fn(),
    createCobroPuntual: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateState: jest.fn(),
    annul: jest.fn(),
    findPaymentStates: jest.fn(),
    findBankCatalog: jest.fn(),
    findCardBrandCatalog: jest.fn(),
    findSaldoFavorByCliente: jest.fn(),
    applySaldoFavor: jest.fn(),
    getDailyCashSummary: jest.fn(),
  };

  const mockUser = (email: string): JwtPayload => ({
    sub: 1,
    usersId: 1,
    sid: 'test-sid',
    email,
    permisos: [],
  });

  const mockPayment = paymentRow({
    pagoId: 1n,
    clienteId: 1n,
    cajaId: null,
    banco: null,
    tarjetaCredito: null,
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
  });

  const mockSaldo = saldoFavorRow({
    saldoFavorId: 1n,
    clienteId: 1n,
    pagoId: null,
    montoSaldo: 50,
    tipoOrigen: 'PAGO_EXCESO',
    disponibleParaAplicar: true,
    createdAt: new Date('2026-06-18'),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: service }],
    }).compile();

    controller = module.get(PaymentsController);
  });

  it('should list states', async () => {
    service.findPaymentStates.mockResolvedValue([
      { codigo: EstadoPago.PENDIENTE },
    ]);
    await expect(controller.findStates()).resolves.toEqual([
      { codigo: EstadoPago.PENDIENTE },
    ]);
  });

  it('should delegate create with current user and return response dto', async () => {
    service.create.mockResolvedValue(mockPayment);
    const result = await controller.create(
      {
        clienteId: '1',
        fechaPago: '2026-06-18',
        montoTotalRecibido: 10,
        detalle: [{ tipoPago: 'PAGO_LIBRE', montoAbonado: 10, formaPagoId: 1 }],
      },
      mockUser('admin@jasrapo.com'),
    );
    expect(result.pagoId).toBe('1');
    expect(service.create).toHaveBeenCalledWith(
      expect.any(Object),
      'admin@jasrapo.com',
    );
  });
  it('should expose POST /payments/cobro-puntual', () => {
    expect(Reflect.getMetadata(PATH_METADATA, PaymentsController)).toBe(
      'payments',
    );
    expect(
      Reflect.getMetadata(PATH_METADATA, controller.createCobroPuntual),
    ).toBe('cobro-puntual');
    expect(
      Reflect.getMetadata(METHOD_METADATA, controller.createCobroPuntual),
    ).toBe(RequestMethod.POST);
  });

  it('should delegate cobro puntual creation with the current user', async () => {
    const dto = {
      clienteId: '1',
      contratoId: '1',
      fechaPago: '2026-06-18',
      items: [{ rubroId: 1, cantidad: 1 }],
    };
    service.createCobroPuntual.mockResolvedValue(mockPayment);

    const result = await controller.createCobroPuntual(
      dto,
      mockUser('admin@jasrapo.com'),
    );

    expect(result.pagoId).toBe('1');
    expect(service.createCobroPuntual).toHaveBeenCalledWith(
      dto,
      'admin@jasrapo.com',
    );
  });

  it('should call findAll on service and map response', async () => {
    const query = {
      page: 1,
      limit: 10,
      fechaDesde: '2026-06-01',
      fechaHasta: '2026-06-30',
    };
    const paginatedResult = {
      data: [mockPayment],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
    service.findAll.mockResolvedValue(paginatedResult);

    const result = await controller.findAll(query);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].pagoId).toBe('1');
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('should call findOne with ParseBigIntPipe', async () => {
    service.findOne.mockResolvedValue(mockPayment);

    const result = await controller.findOne(1n);

    expect(result.pagoId).toBe('1');
    expect(service.findOne).toHaveBeenCalledWith(1n);
  });

  it('should call updateState with params and current user', async () => {
    const dto = { estadoPago: EstadoPago.REGISTRADO };
    service.updateState.mockResolvedValue(
      paymentRow({ ...mockPayment, estadoPago: EstadoPago.REGISTRADO }),
    );

    const result = await controller.updateState(
      1n,
      dto,
      mockUser('admin@test.com'),
    );

    expect(result.estadoPago).toBe(EstadoPago.REGISTRADO);
    expect(service.updateState).toHaveBeenCalledWith(1n, dto, 'admin@test.com');
  });

  it('should call annul with params and current user', async () => {
    const dto = { motivoAnulacion: 'error en pago' };
    service.annul.mockResolvedValue(
      paymentRow({ ...mockPayment, estadoPago: EstadoPago.ANULADO }),
    );

    const result = await controller.annul(
      1n,
      dto,
      mockUser('admin@test.com'),
    );

    expect(result.estadoPago).toBe(EstadoPago.ANULADO);
    expect(service.annul).toHaveBeenCalledWith(1n, {
      motivoAnulacion: 'error en pago',
      anuladoPor: 'admin@test.com',
    });
  });

  it('should call applySaldoFavor with dto and current user', async () => {
    const dto = {
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 50,
      comprobanteId: '2',
      formaPagoId: 1,
    };
    service.applySaldoFavor.mockResolvedValue(mockPayment);

    const result = await controller.applySaldoFavor(
      dto,
      mockUser('admin@test.com'),
    );

    expect(result.pagoId).toBe('1');
    expect(service.applySaldoFavor).toHaveBeenCalledWith(dto, 'admin@test.com');
  });

  it('should call getDailyCashSummary with query', async () => {
    const query = { fecha: '2026-06-18' };
    const summary = {
      fecha: '2026-06-18',
      cajaId: null,
      totalPagos: 5,
      totalRecaudado: 500,
      desglosePorTipoDetalle: [],
      desglosePorTipoComprobante: [],
    };
    service.getDailyCashSummary.mockResolvedValue(summary);

    const result = await controller.getDailyCashSummary(query);

    expect(result).toEqual(summary);
    expect(service.getDailyCashSummary).toHaveBeenCalledWith(query);
  });

  it('should call findSaldoFavorByCliente with ParseBigIntPipe and map response', async () => {
    service.findSaldoFavorByCliente.mockResolvedValue([mockSaldo]);

    const result = await controller.findSaldoFavor(1n);

    expect(result).toHaveLength(1);
    expect(result[0].saldoFavorId).toBe('1');
    expect(service.findSaldoFavorByCliente).toHaveBeenCalledWith(1n);
  });
});
