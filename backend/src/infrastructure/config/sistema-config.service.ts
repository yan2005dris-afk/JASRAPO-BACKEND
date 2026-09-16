import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SistemaConfigRepository } from './sistema-config.repository';
import {
  COBRANZA_DIA_CORTE_MENSUAL,
  COBRANZA_MESES_PARA_CORTE,
  COBRANZA_MESES_PARA_MORA,
} from './sistema-config.keys';

/**
 * Default cache TTL when SISTEMA_CONFIG_CACHE_TTL_MS is not set.
 * 60 seconds matches the locked decision in the SDD spec (REQ-4 / REQ-12).
 */
const DEFAULT_CACHE_TTL_MS = 60_000;

interface CacheEntry {
  value: string | null;
  expiresAt: number;
}

/**
 * Module-level cache. Lives for the lifetime of the Node process and is
 * shared by every `SistemaConfigService` instance — a deliberate choice
 * so that the 60s TTL applies globally rather than per DI scope.
 *
 * The cache stores `null` values verbatim (so a missing key is cached
 * exactly once and not re-queried until the TTL expires) and is exposed
 * via a `__reset` hook so unit tests can clear it between cases.
 */
const CACHE: Map<string, CacheEntry> = new Map();

/**
 * Test-only helper. Clears the module-level cache. Production code should
 * never call this — the cache naturally resets on process restart.
 */
export function __resetSistemaConfigCache(): void {
  CACHE.clear();
}

/**
 * Cached read-only access to `sistema_config`.
 *
 * Wraps `SistemaConfigRepository` with a 60s TTL `Map` cache. Cache
 * entries are stored for both hits and misses (so missing keys do not
 * hammer the DB) and are keyed by the full `clave` string.
 *
 * The cache is module-level on purpose: any DI scope (including request
 * scopes) reuses the same map, so two requests for the same key within
 * 60s always share one DB read.
 */
@Injectable()
export class SistemaConfigService {
  private readonly ttlMs: number;

  constructor(
    private readonly repository: SistemaConfigRepository,
    private readonly configService: ConfigService,
  ) {
    const configured = this.configService.get<number>(
      'SISTEMA_CONFIG_CACHE_TTL_MS',
      DEFAULT_CACHE_TTL_MS,
    );
    this.ttlMs =
      typeof configured === 'number' &&
      Number.isFinite(configured) &&
      configured > 0
        ? configured
        : DEFAULT_CACHE_TTL_MS;
  }

  /**
   * Returns the valor for the given clave, hitting the in-memory cache
   * first. Cache miss or expired entry triggers a single repository read
   * whose result (including `null`) is stored with a fresh `expiresAt`.
   */
  async getAll(): Promise<any[]> {
    return this.repository.findAll();
  }

  async getRecord(clave: string): Promise<any> {
    return this.repository.findRecordByClave(clave);
  }

  /**
   * Returns the valor for the given clave, hitting the in-memory cache
   * first. Cache miss or expired entry triggers a single repository read
   * whose result (including `null`) is stored with a fresh `expiresAt`.
   */
  async getString(clave: string): Promise<string | null> {
    const now = Date.now();
    const hit = CACHE.get(clave);
    if (hit && hit.expiresAt > now) {
      return hit.value;
    }

    const fresh = await this.repository.findByClave(clave);
    CACHE.set(clave, {
      value: fresh,
      expiresAt: now + this.ttlMs,
    });
    return fresh;
  }

  async create(data: {
    clave: string;
    valor: string;
    descripcion?: string | null;
  }): Promise<any> {
    this.validateCollectionCutoffValue(data.clave, data.valor);
    const created = await this.repository.create(data);
    CACHE.delete(data.clave);
    return created;
  }

  async update(
    clave: string,
    data: { valor?: string; descripcion?: string | null },
  ): Promise<any> {
    if (data.valor !== undefined) {
      this.validateCollectionCutoffValue(clave, data.valor);
    }
    const updated = await this.repository.update(clave, data);
    CACHE.delete(clave);
    return updated;
  }

  async delete(clave: string): Promise<any> {
    const deleted = await this.repository.delete(clave);
    CACHE.delete(clave);
    return deleted;
  }

  /**
   * Number of entries currently held in the module-level cache.
   * Intended for diagnostics and test assertions; not a public API.
   */
  get cacheSize(): number {
    return CACHE.size;
  }

  private validateCollectionCutoffValue(clave: string, valor: string): void {
    const max =
      clave === COBRANZA_DIA_CORTE_MENSUAL
        ? 31
        : clave === COBRANZA_MESES_PARA_MORA ||
            clave === COBRANZA_MESES_PARA_CORTE
          ? 120
          : null;
    if (max === null) return;
    if (!/^\d+$/.test(valor.trim())) {
      throw new Error(`${clave} debe ser un entero positivo`);
    }
    const numeric = Number(valor);
    if (!Number.isSafeInteger(numeric) || numeric < 1 || numeric > max) {
      throw new Error(`${clave} debe estar entre 1 y ${max}`);
    }
  }
}
