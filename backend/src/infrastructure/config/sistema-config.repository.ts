import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

/**
 * Thrown when the underlying Prisma client raises a known request error
 * while reading from `sistema_config`. Carries the original error as `cause`
 * so callers can inspect Prisma error codes (e.g. P1001, P1008) if needed.
 */
export class SistemaConfigRepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SistemaConfigRepositoryError';
  }
}

/**
 * Read-only access to the `sistema_config` key/value table.
 *
 * `sistema_config` is a project-wide, non-tenant-scoped key/value store.
 * It is used by application modules (e.g. the reports dispatcher) to look
 * up operator-tunable configuration without a redeploy.
 *
 * This repository is intentionally thin: a single `findByClave` method
 * that returns the stored `valor` (or `null` when the key is absent).
 * All caching, fallback chains, and validation live in
 * `SistemaConfigService` / `ReportStyleService`.
 */
@Injectable()
export class SistemaConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the `valor` column for the given `clave`, or `null` if no row
   * exists with that key.
   *
   * @throws {SistemaConfigRepositoryError} when the underlying Prisma call
   *   fails with a known request error (network, timeout, etc.).
   */
  async findByClave(clave: string): Promise<string | null> {
    try {
      const row = await this.prisma.sistemaConfig.findUnique({
        where: { clave },
        select: { valor: true },
      });
      return row?.valor ?? null;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new SistemaConfigRepositoryError(
          `Failed to read sistema_config[clave=${clave}]`,
          err,
        );
      }
      throw err;
    }
  }
}
