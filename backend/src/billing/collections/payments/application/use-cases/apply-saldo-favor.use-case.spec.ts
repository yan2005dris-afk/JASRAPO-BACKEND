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
  const eventosPendientesRepository = {
    createPending: jest.fn(),
  } as unknown as jest.Mocked<EventosPendientesRepository>;
  const useCase = new ApplySaldoFavorUseCase(
    repository,
    eventosPendientesRepository,
  );

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

  // ─────────────────────────────────────────────────────────────────────
  // G1 — outbox emission when saldo is applied to a comprobante
  //
  // Atomicity contract under test:
  //   All four writes inside `executeTransaction` (createPago, createDetallePago,
  //   updateSaldoFavor, eventosPendientesRepository.createPending) MUST receive
  //   the SAME Prisma TransactionClient, AND createPending MUST be the LAST
  //   write in the callback. A real Prisma `$transaction` would then catch any
  //   throw and roll back every earlier write — that's the property the spec
  //   mandates in G1.S4 ("Pagos row MUST NOT exist", "DetallePago row MUST NOT
  //   exist", "SaldoFavorCliente MUST remain unchanged").
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Wire up a tx-recording mock that captures the tx symbol from each
   * repository write and tracks call order. Returns structural check
   * helpers (`assertSameTx`, `assertOutboxLast`, `assertWritesBeforeFailure`)
   * for verifying tx identity and write order — the closest unit-level
   * proxy for the atomicity contract under test.
   */
  function setupComprobanteTxMock(opts: {
    tx: symbol;
    pagoId: bigint;
    montoSaldo: number;
    importeTotal: number;
    outbox?: { rejectWith?: Error; resolveWith?: any };
  }) {
    const writeOrder: string[] = [];
    let pagoTx: unknown;
    let detalleTx: unknown;
    let saldoTx: unknown;
    let outboxTx: unknown;

    repository.findUniqueSaldoFavor.mockResolvedValue({
      saldoFavorId: 1n,
      clienteId: 1n,
      montoSaldo: opts.montoSaldo,
      disponibleParaAplicar: true,
      deletedAt: null,
    });
    repository.findUniqueComprobante.mockResolvedValue({
      id: 7n,
      importeTotal: opts.importeTotal,
    });

    repository.createPago.mockImplementationOnce(async (_data, _sel, t) => {
      pagoTx = t;
      writeOrder.push('createPago');
      return { pagoId: opts.pagoId };
    });
    repository.createDetallePago.mockImplementationOnce(async (_data, t) => {
      detalleTx = t;
      writeOrder.push('createDetallePago');
    });
    repository.updateSaldoFavor.mockImplementationOnce(async (_w, _d, t) => {
      saldoTx = t;
      writeOrder.push('updateSaldoFavor');
    });
    if (opts.outbox?.rejectWith) {
      const rejectWith: Error = opts.outbox.rejectWith;
      eventosPendientesRepository.createPending.mockImplementationOnce(
        async (_tipo, _payload, _aggT, _aggI, t) => {
          outboxTx = t;
          writeOrder.push('createPending');
          throw rejectWith;
        },
      );
    } else {
      eventosPendientesRepository.createPending.mockImplementationOnce(
        async (_tipo, _payload, _aggT, _aggI, t) => {
          outboxTx = t;
          writeOrder.push('createPending');
          return opts.outbox?.resolveWith ?? {};
        },
      );
    }
    repository.findUniquePago.mockResolvedValue({ pagoId: opts.pagoId });

    return {
      assertSameTx: () => {
        expect(pagoTx).toBe(opts.tx);
        expect(detalleTx).toBe(opts.tx);
        expect(saldoTx).toBe(opts.tx);
        expect(outboxTx).toBe(opts.tx);
      },
      assertOutboxLast: () => {
        expect(writeOrder[writeOrder.length - 1]).toBe('createPending');
      },
      assertWritesBeforeFailure: (expectedWrites: string[]) => {
        // Everything up to (but not including) the throwing call must be in
        // the recorded order. In a real Prisma $transaction, a throw on
        // createPending rolls back the previous writes — this structural
        // check is the closest unit-level proxy.
        const writesBeforeFailure = writeOrder.slice(
          0,
          writeOrder.indexOf('createPending'),
        );
        expect(writesBeforeFailure).toEqual(expectedWrites);
      },
    };
  }

  it('G1.S1: emits pago.validado outbox row when saldo covers the comprobante', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => cb(tx));
    const m = setupComprobanteTxMock({
      tx,
      pagoId: 99n,
      montoSaldo: 100,
      importeTotal: 100,
    });

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 100,
      comprobanteId: '7',
      formaPagoId: 1,
    });

    m.assertSameTx();
    m.assertOutboxLast();
    expect(eventosPendientesRepository.createPending).toHaveBeenCalledTimes(1);
    const [tipo, payload, aggregateType, aggregateId, txArg] =
      eventosPendientesRepository.createPending.mock.calls[0];
    expect(tipo).toBe('pago.validado');
    expect(payload).toEqual({
      pagoId: '99',
      estadoPago: 'REGISTRADO',
      origen: 'SALDO_FAVOR',
      creadoPor: 'SYSTEM',
    });
    expect(aggregateType).toBe('PAGO');
    expect(aggregateId).toBe('99');
    expect(txArg).toBe(tx);
  });

  it('G1.S2: emits pago.validado even when saldo does not cover the comprobante', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => cb(tx));
    const m = setupComprobanteTxMock({
      tx,
      pagoId: 99n,
      montoSaldo: 20,
      importeTotal: 100,
    });

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 20,
      comprobanteId: '7',
      formaPagoId: 1,
    });

    m.assertSameTx();
    m.assertOutboxLast();
    expect(eventosPendientesRepository.createPending).toHaveBeenCalledTimes(1);
    expect(eventosPendientesRepository.createPending.mock.calls[0][0]).toBe(
      'pago.validado',
    );
  });

  it('G1.S3: does NOT emit pago.validado when applied to cuotaConvenioId', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => cb(tx));
    repository.findUniqueSaldoFavor.mockResolvedValue({
      saldoFavorId: 1n,
      clienteId: 1n,
      montoSaldo: 50,
      disponibleParaAplicar: true,
      deletedAt: null,
    });
    repository.findUniqueCuotaConvenio.mockResolvedValue({
      cuotaConvenioId: 5n,
      estado: 'PENDIENTE' as any,
      saldoPendiente: 50,
      montoPagado: 0,
      deletedAt: null,
    });
    repository.updateCuotaConvenio.mockResolvedValue(undefined);
    repository.createPago.mockResolvedValue({ pagoId: 88n });
    repository.createDetallePago.mockResolvedValue(undefined);
    repository.updateSaldoFavor.mockResolvedValue(undefined);
    repository.findUniquePago.mockResolvedValue({ pagoId: 88n });
    eventosPendientesRepository.createPending.mockResolvedValue({} as any);

    await useCase.execute({
      saldoFavorId: '1',
      clienteId: '1',
      montoAplicar: 50,
      cuotaConvenioId: '5',
      formaPagoId: 1,
    });

    expect(eventosPendientesRepository.createPending).not.toHaveBeenCalled();
  });

  it('G1.S4: when createPending throws, the prior writes are recorded (atomicity structural check)', async () => {
    const tx = Symbol('tx') as any;
    repository.executeTransaction.mockImplementation(async (cb: any) => cb(tx));
    const m = setupComprobanteTxMock({
      tx,
      pagoId: 99n,
      montoSaldo: 50,
      importeTotal: 100,
      outbox: { rejectWith: new Error('outbox down') },
    });

    await expect(
      useCase.execute({
        saldoFavorId: '1',
        clienteId: '1',
        montoAplicar: 50,
        comprobanteId: '7',
        formaPagoId: 1,
      }),
    ).rejects.toThrow('outbox down');

    // All four writes shared the same tx.
    m.assertSameTx();

    // The three "committed" writes (Pagos, DetallePago, SaldoFavor) happened
    // BEFORE the throwing createPending. In a real Prisma $transaction, the
    // throw on createPending would roll back the three previous writes —
    // this is the structural atomicity contract the spec mandates.
    m.assertWritesBeforeFailure([
      'createPago',
      'createDetallePago',
      'updateSaldoFavor',
    ]);
    m.assertOutboxLast();
  });
});
