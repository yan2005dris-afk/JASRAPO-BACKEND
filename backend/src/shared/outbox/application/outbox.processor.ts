import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  EventoPendiente,
  EventosPendientesRepository,
} from '../domain/repositories/eventos-pendientes.repository';

const POLL_INTERVAL_MS = 5_000;
const BATCH_SIZE = 10;

export type OutboxHandler = (evento: EventoPendiente) => Promise<void>;

/**
 * Polls the outbox table for pending events and dispatches them to the
 * handler registered for their `tipo`. Handlers register themselves at
 * module-bootstrap time (see PaymentsModule.onModuleInit).
 *
 * Concurrency: a single in-flight batch guard prevents two polling ticks
 * from racing on the same row. Failure isolation: one bad row does NOT
 * block siblings — each is processed independently inside the batch.
 */
@Injectable()
export class OutboxProcessor
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(OutboxProcessor.name);
  private readonly handlers = new Map<string, OutboxHandler>();
  private isProcessing = false;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly repository: EventosPendientesRepository) {}

  registerHandler(tipo: string, handler: OutboxHandler): void {
    this.handlers.set(tipo, handler);
    this.logger.log(`Handler registered for evento tipo="${tipo}"`);
  }

  onApplicationBootstrap(): void {
    this.pollingTimer = setInterval(() => {
      this.processBatch().catch((err) =>
        this.logger.error('Outbox polling tick failed', err),
      );
    }, POLL_INTERVAL_MS);
    this.logger.log(
      `OutboxProcessor polling started (interval: ${POLL_INTERVAL_MS}ms, batch size: ${BATCH_SIZE})`,
    );
  }

  onApplicationShutdown(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.logger.log('OutboxProcessor polling stopped');
  }

  /**
   * Reads a batch of PENDIENTE rows and dispatches each one. Public so
   * tests (and potential admin endpoints) can trigger a tick on demand.
   */
  async processBatch(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    try {
      const pendientes = await this.repository.findAllPending(BATCH_SIZE);

      for (const evento of pendientes) {
        await this.dispatchOne(evento);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async dispatchOne(evento: EventoPendiente): Promise<void> {
    const handler = this.handlers.get(evento.tipo);
    if (!handler) {
      this.logger.warn(`No handler for tipo=${evento.tipo}; id=${evento.id}`);
      await this.repository.markFailed(
        evento.id,
        `No handler registered for tipo=${evento.tipo}`,
      );
      return;
    }
    try {
      await handler(evento);
      await this.repository.markProcessed(evento.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Handler failed for evento id=${evento.id} tipo=${evento.tipo}: ${message}`,
      );
      await this.repository.markFailed(evento.id, message);
    }
  }
}
