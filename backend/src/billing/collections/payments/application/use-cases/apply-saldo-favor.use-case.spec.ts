import { BadRequestException } from '@nestjs/common';
import { ApplySaldoFavorUseCase } from './apply-saldo-favor.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';

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
  const eventosRepository = {
    createPending: jest.fn(),
  } as unknown as jest.Mocked<EventosPendientesRepository>;
  const useCase = new ApplySaldoFavorUseCase(repository, eventosRepository);

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
      repository.findUniqueComprobante.mockResolvedValue({
        id: 1n,
        importeTotal: 100,
      });
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

  // ─── T-G1: pago.validado outbox emission ──────────────────────────────

  it('should emit pago.validado when saldo covers comprobante importeTotal', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findUniqueSaldoFavor.mockResolvedValue({
        saldoFavorId: 1n,
        clienteId: 1n,
        montoSaldo: 100,
        disponibleParaAplicar: true,
        deletedAt: null,
      });
      repository.findUniqueComprobante.mockResolvedValue({
        id: 1n,
        importeTotal: 100,
      });
      repository.createPago.mockResolvedValue({ pagoId: 2n });
      repository.createDetallePago.mockResolvedValue(undefined);
      repository.updateSaldoFavor.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findUniquePago.mockResolvedValue({ pagoId: 2n });

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 100,
      comprobanteId: '1',
      formaPagoId: 1,
    });

    expect(eventosRepository.createPending).toHaveBeenCalledWith(
      'pago.validado',
      { pagoId: '2', estadoPago: 'REGISTRADO' },
      'PAGO',
      '2',
      tx,
    );
  });

  it('should NOT emit pago.validado when saldo does NOT cover importeTotal', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findUniqueSaldoFavor.mockResolvedValue({
        saldoFavorId: 1n,
        clienteId: 1n,
        montoSaldo: 50,
        disponibleParaAplicar: true,
        deletedAt: null,
      });
      repository.findUniqueComprobante.mockResolvedValue({
        id: 1n,
        importeTotal: 100,
      });
      repository.createPago.mockResolvedValue({ pagoId: 3n });
      repository.createDetallePago.mockResolvedValue(undefined);
      repository.updateSaldoFavor.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findUniquePago.mockResolvedValue({ pagoId: 3n });

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 50,
      comprobanteId: '1',
      formaPagoId: 1,
    });

    expect(eventosRepository.createPending).not.toHaveBeenCalled();
  });

  it('should NOT emit pago.validado when applied to cuotaConvenioId (no comprobanteId)', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findUniqueSaldoFavor.mockResolvedValue({
        saldoFavorId: 1n,
        clienteId: 1n,
        montoSaldo: 100,
        disponibleParaAplicar: true,
        deletedAt: null,
      });
      repository.findUniqueCuotaConvenio.mockResolvedValue({
        cuotaConvenioId: 5n,
        estado: 'PENDIENTE',
        saldoPendiente: 100,
        montoPagado: 0,
        deletedAt: null,
      });
      repository.updateCuotaConvenio.mockResolvedValue(undefined);
      repository.createPago.mockResolvedValue({ pagoId: 4n });
      repository.createDetallePago.mockResolvedValue(undefined);
      repository.updateSaldoFavor.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findUniquePago.mockResolvedValue({ pagoId: 4n });

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

  // ─── T-G2d: cuota.pagada from ApplySaldoFavorUseCase ─────────────────

  it('should emit cuota.pagada when saldo fully pays a cuota', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findUniqueSaldoFavor.mockResolvedValue({
        saldoFavorId: 1n,
        clienteId: 1n,
        montoSaldo: 100,
        disponibleParaAplicar: true,
        deletedAt: null,
      });
      repository.findUniqueCuotaConvenio.mockResolvedValue({
        cuotaConvenioId: 5n,
        estado: 'PENDIENTE',
        saldoPendiente: 100,
        montoPagado: 0,
        deletedAt: null,
      });
      repository.updateCuotaConvenio.mockResolvedValue(undefined);
      repository.createPago.mockResolvedValue({ pagoId: 5n });
      repository.createDetallePago.mockResolvedValue(undefined);
      repository.updateSaldoFavor.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findUniquePago.mockResolvedValue({ pagoId: 5n });

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

  it('should NOT emit cuota.pagada when saldo partially pays a cuota', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => {
      repository.findUniqueSaldoFavor.mockResolvedValue({
        saldoFavorId: 1n,
        clienteId: 1n,
        montoSaldo: 50,
        disponibleParaAplicar: true,
        deletedAt: null,
      });
      repository.findUniqueCuotaConvenio.mockResolvedValue({
        cuotaConvenioId: 5n,
        estado: 'PENDIENTE',
        saldoPendiente: 100,
        montoPagado: 0,
        deletedAt: null,
      });
      repository.updateCuotaConvenio.mockResolvedValue(undefined);
      repository.createPago.mockResolvedValue({ pagoId: 6n });
      repository.createDetallePago.mockResolvedValue(undefined);
      repository.updateSaldoFavor.mockResolvedValue(undefined);
      return cb(tx);
    });
    repository.findUniquePago.mockResolvedValue({ pagoId: 6n });

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 50,
      cuotaConvenioId: '5',
      formaPagoId: 1,
    });

    expect(eventosRepository.createPending).not.toHaveBeenCalledWith(
      'cuota.pagada',
      expect.anything(),
    );
  });
});
