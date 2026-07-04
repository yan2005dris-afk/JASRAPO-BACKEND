import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EstadoPago } from 'src/generated/prisma/enums';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../../application/payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  const service = {
    create: jest.fn(),
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

  it('should delegate create with current user', async () => {
    service.create.mockResolvedValue({ pagoId: '1' });
    await expect(
      controller.create(
        {
          clienteId: '1',
          fechaPago: '2026-06-18',
          montoTotalRecibido: 10,
          detalle: [
            { tipoPago: 'PAGO_LIBRE' as any, montoAbonado: 10, formaPagoId: 1 },
          ],
        },
        { email: 'admin@jasrapo.com' },
      ),
    ).resolves.toEqual({ pagoId: '1' });
    expect(service.create).toHaveBeenCalledWith(
      expect.any(Object),
      'admin@jasrapo.com',
    );
  });

  it('should call findAll on service', async () => {
    const query = {
      page: 1,
      limit: 10,
      fechaDesde: '2026-06-01',
      fechaHasta: '2026-06-30',
    };
    const paginatedResult = {
      data: [{ pagoId: '1', clienteId: '1', estadoPago: EstadoPago.PENDIENTE }],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        ultimaPagina: 1,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    };
    service.findAll.mockResolvedValue(paginatedResult);

    const result = await controller.findAll(query);

    expect(result).toEqual(paginatedResult);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('should call findOne with ParseBigIntPipe', async () => {
    const payment = {
      pagoId: '1',
      clienteId: '1',
      estadoPago: EstadoPago.PENDIENTE,
    };
    service.findOne.mockResolvedValue(payment);

    const result = await controller.findOne(1n);

    expect(result).toEqual(payment);
    expect(service.findOne).toHaveBeenCalledWith(1n);
  });

  it('should call updateState with params and current user', async () => {
    const dto = { estadoPago: EstadoPago.REGISTRADO };
    const payment = { pagoId: '1', estadoPago: EstadoPago.REGISTRADO };
    service.updateState.mockResolvedValue(payment);

    const result = await controller.updateState(1n, dto, {
      email: 'admin@test.com',
    });

    expect(result).toEqual(payment);
    expect(service.updateState).toHaveBeenCalledWith(1n, dto, 'admin@test.com');
  });

  it('should call annul with params and current user', async () => {
    const dto = { motivoAnulacion: 'error en pago' };
    const payment = { pagoId: '1', estadoPago: EstadoPago.ANULADO };
    service.annul.mockResolvedValue(payment);

    const result = await controller.annul(1n, dto, { email: 'admin@test.com' });

    expect(result).toEqual(payment);
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
    const payment = { pagoId: '1' };
    service.applySaldoFavor.mockResolvedValue(payment);

    const result = await controller.applySaldoFavor(dto, {
      email: 'admin@test.com',
    });

    expect(result).toEqual(payment);
    expect(service.applySaldoFavor).toHaveBeenCalledWith(dto, 'admin@test.com');
  });

  it('should call getDailyCashSummary with query', async () => {
    const query = { fecha: '2026-06-18' };
    const summary = { fecha: '2026-06-18', totalPagos: 5, totalRecaudado: 500 };
    service.getDailyCashSummary.mockResolvedValue(summary);

    const result = await controller.getDailyCashSummary(query);

    expect(result).toEqual(summary);
    expect(service.getDailyCashSummary).toHaveBeenCalledWith(query);
  });

  it('should call findSaldoFavorByCliente with ParseBigIntPipe', async () => {
    const saldos = [{ saldoFavorId: '1', clienteId: '1', montoSaldo: 50 }];
    service.findSaldoFavorByCliente.mockResolvedValue(saldos);

    const result = await controller.findSaldoFavor(1n);

    expect(result).toEqual(saldos);
    expect(service.findSaldoFavorByCliente).toHaveBeenCalledWith(1n);
  });
});
