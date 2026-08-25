/**
 * Puerto de logging.
 *
 * Define el contrato de logging que la capa de application puede
 * consumir sin acoplarse a una implementación concreta (Nest `Logger`,
 * Winston, Pino, etc.). La implementación vive en
 * `infrastructure/observability/logger/logger.service.ts`.
 *
 * SC-186 mueve este contrato al dominio/shared para que use-cases de
 * SRI/Reports (y del resto) puedan depender de la abstracción.
 */
export interface LoggerPort {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}

export const LOGGER_PORT = Symbol('LoggerPort');
