import { OutboxProcessor, OutboxHandler } from './outbox.processor';
import type {
  EventoPendiente,
  EventosPendientesRepository,
} from '../domain/repositories/eventos-pendientes.repository';
import { EstadoEvento } from 'src/shared/enums';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

/**
 * SAFETY NET — fresh file, no prior tests to protect.
 *
 * Strategy: stub the repository and assert the processor's lifecycle:
 * registerHandler(processBatch), each branch (success / failure / no-handler)
 * must hit markProcessed or markFailed with real arguments.
 */
describe('OutboxProcessor', () => {
  let repository: jest.Mocked<EventosPendientesRepository>;
  let processor: OutboxProcessor;

  beforeEach(() => {
    jest.useFakeTimers();
    repository = {
      createPending: jest.fn(),
      findPendingByTipo: jest.fn(),
      findAllPending: jest.fn(),
      markProcessed: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };

    processor = new OutboxProcessor(repository, mockLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function mkEvento(overrides: Partial<EventoPendiente> = {}): EventoPendiente {
    return {
      id: 1n,
      tipo: 'pago.validado',
      aggregateType: 'PAGO',
      aggregateId: '1',
      payload: { pagoId: '1' },
      estado: EstadoEvento.PENDIENTE,
      intentos: 0,
      ultimoError: null,
      createdAt: new Date(),
      processedAt: null,
      ...overrides,
    };
  }

  // ─── registerHandler ───────────────────────────────────────────────────

  describe('registerHandler', () => {
    it('accepts a handler for pago.validado and the next processBatch dispatches it', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      processor.registerHandler('pago.validado', handler);

      const e = mkEvento({ id: 1n });
      repository.findAllPending.mockResolvedValue([e]);

      await processor.processBatch();

      expect(handler).toHaveBeenCalledWith(e);
      expect(repository.markProcessed).toHaveBeenCalledWith(1n);
    });

    it('overwrites a previously registered handler for the same tipo (last writer wins)', async () => {
      const first = jest.fn().mockResolvedValue(undefined);
      const second = jest.fn().mockResolvedValue(undefined);

      processor.registerHandler('pago.validado', first);
      processor.registerHandler('pago.validado', second);

      const e = mkEvento({ id: 1n });
      repository.findAllPending.mockResolvedValue([e]);

      await processor.processBatch();

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith(e);
    });
  });

  // ─── findAllPending (multi-tipo) ───────────────────────────────────────

  describe('findAllPending', () => {
    it('processes a mixed batch of multiple event tipos in a single tick', async () => {
      const handler1 = jest.fn().mockResolvedValue(undefined);
      const handler2 = jest.fn().mockResolvedValue(undefined);
      processor.registerHandler('pago.validado', handler1);
      processor.registerHandler('cuota.pagada', handler2);

      const e1 = mkEvento({ id: 1n, tipo: 'pago.validado' });
      const e2 = mkEvento({ id: 2n, tipo: 'cuota.pagada' });
      repository.findAllPending.mockResolvedValue([e1, e2]);

      await processor.processBatch();

      expect(handler1).toHaveBeenCalledWith(e1);
      expect(handler2).toHaveBeenCalledWith(e2);
      expect(repository.markProcessed).toHaveBeenCalledTimes(2);
    });
  });

  // ─── processBatch ──────────────────────────────────────────────────────

  describe('processBatch', () => {
    it('reads at most 10 pending rows for pago.validado and dispatches each to the registered handler', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      processor.registerHandler('pago.validado', handler);

      const e1 = mkEvento({ id: 1n, payload: { pagoId: '1' } });
      const e2 = mkEvento({ id: 2n, payload: { pagoId: '2' } });
      repository.findAllPending.mockResolvedValue([e1, e2]);

      await processor.processBatch();

      expect(repository.findAllPending).toHaveBeenCalledWith(10);
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, e1);
      expect(handler).toHaveBeenNthCalledWith(2, e2);
    });

    it('marks every successfully processed row as PROCESADO', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      processor.registerHandler('pago.validado', handler);

      const e1 = mkEvento({ id: 1n });
      const e2 = mkEvento({ id: 2n });
      repository.findAllPending.mockResolvedValue([e1, e2]);

      await processor.processBatch();

      expect(repository.markProcessed).toHaveBeenCalledTimes(2);
      expect(repository.markProcessed).toHaveBeenNthCalledWith(1, 1n);
      expect(repository.markProcessed).toHaveBeenNthCalledWith(2, 2n);
      expect(repository.markFailed).not.toHaveBeenCalled();
    });

    it('marks a failed row as FALLIDO with the handler error and does NOT block sibling rows', async () => {
      const handler = jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('comprobante-not-found'))
        .mockResolvedValueOnce(undefined);
      processor.registerHandler('pago.validado', handler);

      const ok1 = mkEvento({ id: 100n });
      const boom = mkEvento({ id: 200n });
      const ok2 = mkEvento({ id: 300n });
      repository.findAllPending.mockResolvedValue([ok1, boom, ok2]);

      await processor.processBatch();

      expect(handler).toHaveBeenCalledTimes(3);
      expect(repository.markProcessed).toHaveBeenCalledTimes(2);
      expect(repository.markProcessed).toHaveBeenCalledWith(100n);
      expect(repository.markProcessed).toHaveBeenCalledWith(300n);
      expect(repository.markFailed).toHaveBeenCalledTimes(1);
      expect(repository.markFailed).toHaveBeenCalledWith(
        200n,
        'comprobante-not-found',
      );
    });

    it('R-C.1: marks failed when tipo has no registered handler', async () => {
      const warnSpy = jest
        .spyOn((processor as any).logger, 'warn')
        .mockImplementation(() => undefined);

      const e = mkEvento({ id: 5n, tipo: 'unknown.event' });
      repository.findAllPending.mockResolvedValue([e]);

      await processor.processBatch();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No handler for tipo=unknown.event'),
      );
      // R-C.1: orphan events must be marked failed so they don't poll forever
      expect(repository.markProcessed).not.toHaveBeenCalled();
      expect(repository.markFailed).toHaveBeenCalledWith(
        5n,
        expect.stringContaining('No handler registered'),
      );
    });

    it('does nothing when there are no pending rows', async () => {
      const handler = jest.fn();
      processor.registerHandler('pago.validado', handler);

      repository.findAllPending.mockResolvedValue([]);

      await processor.processBatch();

      expect(handler).not.toHaveBeenCalled();
      expect(repository.markProcessed).not.toHaveBeenCalled();
    });

    it('runs serially — a second invocation while one is in flight is a no-op', async () => {
      let releaseFirst: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
      const handler = jest.fn().mockImplementationOnce(async () => {
        // Hold the first batch hostage so a second call can observe the lock.
        await gate;
      });
      processor.registerHandler('pago.validado', handler);
      repository.findAllPending.mockResolvedValue([mkEvento({ id: 1n })]);

      const first = processor.processBatch();
      // While the first batch is mid-flight, a second call must short-circuit.
      const second = processor.processBatch();
      // If the second call had entered the loop, findPendingByTipo would have
      // been called twice. Releasing the gate lets the first batch finish and
      // proves the second call did NOT double-dispatch.
      releaseFirst();
      await Promise.all([first, second]);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(repository.markProcessed).toHaveBeenCalledTimes(1);
      // The second call took the fast-path: never invoked findAllPending.
      expect(repository.findAllPending).toHaveBeenCalledTimes(1);
    });

    it('resets isProcessing even when the handler throws so the next tick can run', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('bad-pago'));
      processor.registerHandler('pago.validado', handler);
      repository.findAllPending.mockResolvedValue([mkEvento({ id: 9n })]);

      await processor.processBatch();

      // Second cycle: must still execute (i.e. the lock is released).
      repository.findAllPending.mockResolvedValue([]);
      await expect(processor.processBatch()).resolves.toBeUndefined();
    });
  });
});
