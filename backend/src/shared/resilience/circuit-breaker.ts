import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

/**
 * A lightweight generic Circuit Breaker for resilience.
 * State machine: CLOSED -> OPEN -> HALF-OPEN -> CLOSED.
 * Prevents hammering degraded or downed services.
 */
export class SimpleCircuitBreaker {
  private readonly context: string;
  private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
  private failureCount = 0;
  private nextAttemptTime = 0;

  constructor(
    private readonly logger: LoggerService,
    private readonly name: string,
    private readonly threshold = 5,
    private readonly cooldownMs = 30000,
    private readonly isBusinessError?: (error: unknown) => boolean,
  ) {
    this.context = `${SimpleCircuitBreaker.name}:${name}`;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttemptTime) {
        this.logger.warn(
          `Circuit Breaker is HALF-OPEN. Testing service availability.`,
          this.context,
        );
        this.state = 'HALF-OPEN';
      } else {
        throw new Error(`Circuit Breaker is OPEN. Request fast-failed.`);
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF-OPEN') {
        this.logger.log(
          `Circuit Breaker is CLOSED again. Service recovered.`,
          this.context,
        );
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      return result;
    } catch (error) {
      if (this.isBusinessError && this.isBusinessError(error)) {
        // Business errors do not count as infrastructure failures and should not trip the breaker
        throw error;
      }

      this.failureCount++;
      this.logger.warn(
        `Failure [${this.failureCount}/${this.threshold}] on Circuit Breaker: ${(error as Error).message}`,
        this.context,
      );

      if (this.state === 'HALF-OPEN' || this.failureCount >= this.threshold) {
        this.logger.error(
          `Circuit Breaker is now OPEN. Cooldown active for ${this.cooldownMs}ms.`,
          undefined,
          this.context,
        );
        this.state = 'OPEN';
        this.nextAttemptTime = Date.now() + this.cooldownMs;
      }
      throw error;
    }
  }
}
