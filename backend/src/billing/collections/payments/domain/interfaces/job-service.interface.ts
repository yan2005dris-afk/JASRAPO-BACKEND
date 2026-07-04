/**
 * Contract for dispatching background jobs (via PgBoss).
 *
 * Extracted from `pago-validado.handler.ts` so both the handler and
 * SRIEmissionDispatcherService import from a shared types location instead
 * of a circular-like cross-import.
 */
export abstract class JobService {
  abstract send(name: string, data: object): Promise<string>;
}
