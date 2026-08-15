import type { EstadoEvento } from 'src/shared/enums';

export interface EventoPendiente {
  id: bigint;
  tipo: string;
  aggregateType: string | null;
  aggregateId: string | null;
  payload: Record<string, unknown>;
  estado: EstadoEvento;
  intentos: number;
  ultimoError: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

export abstract class EventosPendientesRepository {
  /**
   * Inserts a new outbox row with estado=PENDIENTE inside the given tx
   * (or the global client if no tx). The transaction must belong to the
   * caller so the write is atomic with the aggregate change.
   */
  abstract createPending(
    tipo: string,
    payload: Record<string, unknown>,
    aggregateType?: string,
    aggregateId?: string,
    tx?: any,
  ): Promise<EventoPendiente>;

  /**
   * Returns up to `limit` oldest PENDIENTE rows for a given event tipo,
   * ordered by createdAt ascending so FIFO is preserved.
   */
  abstract findPendingByTipo(
    tipo: string,
    limit: number,
  ): Promise<EventoPendiente[]>;

  /**
   * Returns up to `limit` oldest PENDIENTE rows across ALL event tipos,
   * ordered by createdAt ascending so FIFO is preserved. Used by the
   * OutboxProcessor to process any registered tipo in a single batch.
   */
  abstract findAllPending(limit: number): Promise<EventoPendiente[]>;

  /**
   * Marks the row as PROCESADO and stamps processedAt.
   */
  abstract markProcessed(id: bigint): Promise<void>;

  /**
   * Increments intentos and stores the latest error message. estado remains
   * PENDIENTE so the next polling cycle retries; if the caller wants to mark
   * the row permanently failed, it can change the status out of band.
   */
  abstract markFailed(id: bigint, error: string): Promise<void>;
}
