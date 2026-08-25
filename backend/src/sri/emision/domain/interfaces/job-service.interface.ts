/**
 * Contract for dispatching background jobs (via PgBoss).
 *
 * Extracted from `pago-validado.handler.ts` so both the handler and
 * SRIEmissionDispatcherService import from a shared types location instead
 * of a circular-like cross-import.
 *
 * Owned by `sri/emision/` because the only consumer that enqueues jobs from
 * application code is `SRIEmissionDispatcherService` (a SRI-domain service).
 * `PagoValidadoHandler` / `CuotaPagadaHandler` depend on this interface but
 * never instantiate it; the concrete binding comes from `JobsService` via the
 * `'JobService'` injection token supplied by `PaymentsModule`.
 */
export interface JobSendOptions {
  retryLimit?: number;
  retryDelay?: number;
  retryDelayMax?: number;
  retryBackoff?: boolean;
  expireInSeconds?: number;
  // Opciones adicionales se manejan a nivel de implementación concreta
  // (PgBoss). Si el dominio necesita alguna, se agrega acá como campo
  // tipado, no como index signature genérico.
}

export abstract class JobService {
  abstract send(
    name: string,
    data: object,
    options?: JobSendOptions,
  ): Promise<string>;
}
