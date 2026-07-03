import { PrismaEventosPendientesRepository } from './prisma-eventos-pendientes.repository';
import { EstadoEvento } from 'src/shared/enums';

/**
 * SAFETY NET: these tests stub PrismaService at the boundary that matters — the
 * `eventosPendientes` model delegate. The real repo just forwards calls to it,
 * so unit-level coverage here is the highest-leverage guarantee that the
 * production code wires up the model correctly.
 */
describe('PrismaEventosPendientesRepository', () => {
  let delegate: {
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  let repository: PrismaEventosPendientesRepository;

  beforeEach(() => {
    delegate = {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    };
    repository = new PrismaEventosPendientesRepository({
      eventosPendientes: delegate,
    } as any);
  });

  // ─── createPending ──────────────────────────────────────────────────────

  describe('createPending', () => {
    it('persists a row with estado=PENDIENTE and intentos=0 by default', async () => {
      delegate.create.mockResolvedValue({
        id: 1n,
        tipo: 'pago.validado',
        aggregateType: null,
        aggregateId: null,
        payload: { pagoId: '1' },
        estado: EstadoEvento.PENDIENTE,
        intentos: 0,
        ultimoError: null,
        createdAt: new Date(),
        processedAt: null,
      });

      await repository.createPending('pago.validado', { pagoId: '1' });

      const data = delegate.create.mock.calls[0]![0]!.data;
      expect(data.tipo).toBe('pago.validado');
      expect(data.estado).toBe(EstadoEvento.PENDIENTE);
      expect(data.intentos).toBe(0);
      expect(data.payload).toEqual({ pagoId: '1' });
      expect(data.aggregateType).toBeUndefined();
      expect(data.aggregateId).toBeUndefined();
    });

    it('forwards aggregateType/aggregateId when supplied and routes the write through the supplied tx so it joins the surrounding transaction', async () => {
      // The tx object is a Prisma TransactionClient placeholder. The repository
      // MUST call delegate.create on the tx (not on the global prisma client),
      // otherwise the outbox row would not be part of the caller's transaction
      // and atomicity would be lost.
      const tx = {
        eventosPendientes: {
          create: jest.fn().mockResolvedValue({
            id: 2n,
            tipo: 'pago.validado',
            aggregateType: 'PAGO',
            aggregateId: '7',
            payload: { pagoId: '7' },
            estado: EstadoEvento.PENDIENTE,
            intentos: 0,
            ultimoError: null,
            createdAt: new Date(),
            processedAt: null,
          }),
        },
      };
      // Build a repository with a tx-aware delegate
      const repoWithTx = new PrismaEventosPendientesRepository({
        eventosPendientes: delegate,
      } as any);

      await repoWithTx.createPending(
        'pago.validado',
        { pagoId: '7' },
        'PAGO',
        '7',
        tx as any,
      );

      // The global delegate MUST NOT be called when a tx is provided.
      expect(delegate.create).not.toHaveBeenCalled();
      // The tx-bound delegate must receive the create with aggregate fields.
      expect(tx.eventosPendientes.create).toHaveBeenCalledTimes(1);
      const args = tx.eventosPendientes.create.mock.calls[0]![0]!;
      expect(args.data.tipo).toBe('pago.validado');
      expect(args.data.aggregateType).toBe('PAGO');
      expect(args.data.aggregateId).toBe('7');
      expect(args.data.estado).toBe(EstadoEvento.PENDIENTE);
    });

    it('returns the persisted row mapped to EventoPendiente shape', async () => {
      const now = new Date('2026-07-01T00:00:00.000Z');
      delegate.create.mockResolvedValue({
        id: 5n,
        tipo: 'pago.validado',
        aggregateType: 'PAGO',
        aggregateId: '42',
        payload: { pagoId: '42' },
        estado: EstadoEvento.PENDIENTE,
        intentos: 0,
        ultimoError: null,
        createdAt: now,
        processedAt: null,
      });

      const result = await repository.createPending(
        'pago.validado',
        { pagoId: '42' },
        'PAGO',
        '42',
      );

      expect(result).toEqual({
        id: 5n,
        tipo: 'pago.validado',
        aggregateType: 'PAGO',
        aggregateId: '42',
        payload: { pagoId: '42' },
        estado: EstadoEvento.PENDIENTE,
        intentos: 0,
        ultimoError: null,
        createdAt: now,
        processedAt: null,
      });
    });
  });

  // ─── findPendingByTipo ──────────────────────────────────────────────────

  describe('findPendingByTipo', () => {
    it('filters by tipo + estado=PENDIENTE, limits results, and orders by createdAt asc', async () => {
      delegate.findMany.mockResolvedValue([]);

      await repository.findPendingByTipo('pago.validado', 10);

      const args = delegate.findMany.mock.calls[0]![0]!;
      expect(args.where).toEqual({
        tipo: 'pago.validado',
        estado: EstadoEvento.PENDIENTE,
      });
      expect(args.take).toBe(10);
      expect(args.orderBy).toEqual({ createdAt: 'asc' });
    });

    it('maps the returned rows into EventoPendiente shape', async () => {
      const createdAt = new Date('2026-07-01T00:00:00.000Z');
      delegate.findMany.mockResolvedValue([
        {
          id: 11n,
          tipo: 'pago.validado',
          aggregateType: 'PAGO',
          aggregateId: '1',
          payload: { pagoId: '1' },
          estado: EstadoEvento.PENDIENTE,
          intentos: 0,
          ultimoError: null,
          createdAt,
          processedAt: null,
        },
      ]);

      const result = await repository.findPendingByTipo('pago.validado', 5);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 11n,
        tipo: 'pago.validado',
        aggregateType: 'PAGO',
        aggregateId: '1',
        payload: { pagoId: '1' },
        estado: EstadoEvento.PENDIENTE,
        intentos: 0,
        ultimoError: null,
        createdAt,
        processedAt: null,
      });
    });
  });

  // ─── markProcessed ──────────────────────────────────────────────────────

  describe('markProcessed', () => {
    it('flips estado to PROCESADO and stamps processedAt = now', async () => {
      delegate.update.mockResolvedValue({});

      await repository.markProcessed(99n);

      const args = delegate.update.mock.calls[0]![0]!;
      expect(args.where).toEqual({ id: 99n });
      expect(args.data.estado).toBe(EstadoEvento.PROCESADO);
      expect(args.data.processedAt).toBeInstanceOf(Date);
    });

    it('records the actual processedAt instant it ran so retries are auditable', async () => {
      delegate.update.mockResolvedValue({});
      const before = Date.now();

      await repository.markProcessed(123n);

      const args = delegate.update.mock.calls[0]![0]!;
      const processedAtMs = (args.data.processedAt as Date).getTime();
      const after = Date.now();
      expect(processedAtMs).toBeGreaterThanOrEqual(before);
      expect(processedAtMs).toBeLessThanOrEqual(after);
    });
  });

  // ─── markFailed ─────────────────────────────────────────────────────────

  describe('markFailed', () => {
    it('increments intentos and stores the error message; estado stays PENDIENTE for retry', async () => {
      delegate.update.mockResolvedValue({});

      await repository.markFailed(123n, 'boom');

      const args = delegate.update.mock.calls[0]![0]!;
      expect(args.where).toEqual({ id: 123n });
      expect(args.data.ultimoError).toBe('boom');
      expect(args.data.intentos).toEqual({ increment: 1 });
      expect(args.data.estado).toBeUndefined();
    });

    it('preserves the previous error if a new one is not supplied (idempotent)', async () => {
      delegate.update.mockResolvedValue({});

      await repository.markFailed(7n, 'first failure');

      const args = delegate.update.mock.calls[0]![0]!;
      expect(args.data.ultimoError).toBe('first failure');
    });
  });
});
