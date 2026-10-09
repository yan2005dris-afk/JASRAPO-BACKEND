import { BadRequestException } from '@nestjs/common';
import { ApplySaldoFavorUseCase } from './apply-saldo-favor.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import { PaymentRow } from '../../domain/types/payment.types';
import { SaldoFavorRow } from '../../domain/types/payment.types';
import {
  paymentRow,
  paymentDetailRow,
  saldoFavorRow,
} from '../../__test-utils__/payment-row.factory';

describe('ApplySaldoFavorUseCase', () => {
  const repository = {
    executeTransaction: jest.fn(),
    findById: jest.fn(),
    findSaldoFavorById: jest.fn(),
    findComprobanteById: jest.fn(),
    findCuotaConvenioById: jest.fn(),
    updateCuotaConvenioPayment: jest.fn(),
    createPagoRecord: jest.fn(),
    createDetallesPago: jest.fn(),
    updateSaldoFavorRecord: jest.fn(),
  } as unknown as jest.Mocked<PaymentRepository>;
  const eventosRepository = {
    createPending: jest.fn(),
  } as unknown as jest.Mocked<EventosPendientesRepository>;
  const useCase = new ApplySaldoFavorUseCase(repository, eventosRepository);

  const mockPayment = paymentRow({
    pagoId: 2n,
    clienteId: 1n,
    montoTotalRecibido: 10,
    fechaPago: new Date(),
    estadoPago: 'REGISTRADO',
    creadoPor: 'SYSTEM',
    createdAt: new Date(),
  });

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
      repository.findSaldoFavorById.mockResolvedValue(
        saldoFavorRow({
          saldoFavorId: 1n,
          clienteId: 1n,
          montoSaldo: 10,
          tipoOrigen: 'PAGO_EXCESO',
          disponibleParaAplicar: true,
          deletedAt: null,
          createdAt: new Date(),
        }),
      );
      repository.findComprobanteById.mockResolvedValue({
        id: 1n,
        importeTotal: 100,
      });
      repository.createPagoRecord.mockResolvedValue({ pagoId: 2n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      repository.updateSaldoFavorRecord.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockPayment);

    const result = await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 10,
      comprobanteId: '1',
      formaPagoId: 1,
    });

    expect(result).toBe(mockPayment);
  });

  it('should emit pago.validado when saldo is applied to a comprobante (unconditional)', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findSaldoFavorById.mockResolvedValue(
        saldoFavorRow({
          saldoFavorId: 1n,
          clienteId: 1n,
          montoSaldo: 100,
          tipoOrigen: 'PAGO_EXCESO',
          disponibleParaAplicar: true,
          deletedAt: null,
          createdAt: new Date(),
        }),
      );
      repository.findComprobanteById.mockResolvedValue({
        id: 1n,
        importeTotal: 100,
      });
      repository.createPagoRecord.mockResolvedValue({ pagoId: 2n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      repository.updateSaldoFavorRecord.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockPayment);

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 100,
      comprobanteId: '1',
      formaPagoId: 1,
    });

    expect(eventosRepository.createPending).toHaveBeenCalledWith(
      'pago.validado',
      {
        pagoId: '2',
        estadoPago: 'REGISTRADO',
        origen: 'SALDO_FAVOR',
        creadoPor: 'SYSTEM',
      },
      'PAGO',
      '2',
      tx,
    );
  });

  it('should NOT emit pago.validado when applied to cuotaConvenioId (no comprobanteId)', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findSaldoFavorById.mockResolvedValue(
        saldoFavorRow({
          saldoFavorId: 1n,
          clienteId: 1n,
          montoSaldo: 100,
          tipoOrigen: 'PAGO_EXCESO',
          disponibleParaAplicar: true,
          deletedAt: null,
          createdAt: new Date(),
        }),
      );
      repository.findCuotaConvenioById.mockResolvedValue({
        cuotaConvenioId: 5n,
        convenioId: 1n,
        estado: 'PENDIENTE',
        saldoPendiente: 100,
        montoPagado: 0,
        deletedAt: null,
      });
      repository.updateCuotaConvenioPayment.mockResolvedValue({ count: 1 });
      repository.createPagoRecord.mockResolvedValue({ pagoId: 4n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      repository.updateSaldoFavorRecord.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockPayment);

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 100,
      cuotaConvenioId: '5',
      formaPagoId: 1,
    });

    expect(eventosRepository.createPending).not.toHaveBeenCalledWith(
      'pago.validado',
      expect.anything(),
    );
  });

  it('should emit cuota.pagada when saldo fully pays a cuota', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findSaldoFavorById.mockResolvedValue(
        saldoFavorRow({
          saldoFavorId: 1n,
          clienteId: 1n,
          montoSaldo: 100,
          tipoOrigen: 'PAGO_EXCESO',
          disponibleParaAplicar: true,
          deletedAt: null,
          createdAt: new Date(),
        }),
      );
      repository.findCuotaConvenioById.mockResolvedValue({
        cuotaConvenioId: 5n,
        convenioId: 1n,
        estado: 'PENDIENTE',
        saldoPendiente: 100,
        montoPagado: 0,
        deletedAt: null,
      });
      repository.updateCuotaConvenioPayment.mockResolvedValue({ count: 1 });
      repository.createPagoRecord.mockResolvedValue({ pagoId: 5n });
      repository.createDetallesPago.mockResolvedValue(undefined);
      repository.updateSaldoFavorRecord.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findById.mockResolvedValue(mockPayment);

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 100,
      cuotaConvenioId: '5',
      formaPagoId: 1,
    });

    expect(eventosRepository.createPending).toHaveBeenCalledWith(
      'cuota.pagada',
      {
        cuotaConvenioId: '5',
        pagoId: '5',
      },
      'CUOTA_CONVENIO',
      '5',
      tx,
    );
  });
});
