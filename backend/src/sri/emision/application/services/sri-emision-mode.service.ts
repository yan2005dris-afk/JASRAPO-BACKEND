import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../../../infrastructure/audit/audit.service';
import { SistemaConfigService } from '../../../../infrastructure/config/sistema-config.service';
import { SRI_EMISION_MODO } from '../../../../infrastructure/config/sistema-config.keys';

/**
 * Allowed values for `sri.emision.modo`. Anything outside this set is a
 * misconfiguration (typo, manual DB edit) and triggers the
 * fallback-to-automatico path that records an audit row.
 */
export type SriEmisionModo = 'automatico' | 'manual';

const ALLOWED_MODOS: ReadonlyArray<SriEmisionModo> = ['automatico', 'manual'];
const FALLBACK: SriEmisionModo = 'automatico';

/**
 * SriEmisionModeService
 *
 * Read-only service that returns the current SRI emission mode
 * (`'automatico' | 'manual'`) by consulting `sistema_config`. Backed by
 * `SistemaConfigService` (60s in-memory cache, project-wide via `@Global`).
 *
 * Failure modes:
 *   - Missing key → returns `automatico`, logs a warn, audits one row.
 *   - Invalid value (typo, manual edit) → same fallback + audit.
 *
 * The audit row uses the existing generic `auditoria` table via
 * `AuditService.log({accion:'modo-invalido-fallback', ...})` — no new
 * SRI-specific table (see sdd/sri-emision-modo-manual-automatico).
 */
@Injectable()
export class SriEmisionModeService {
  private readonly logger = new Logger(SriEmisionModeService.name);

  constructor(
    private readonly sistemaConfig: SistemaConfigService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Returns the current SRI emission mode.
   *
   * Never throws — unknown / missing values degrade to `automatico` so a
   * bad config never breaks the production dispatcher.
   */
  async getMode(): Promise<SriEmisionModo> {
    const raw = await this.sistemaConfig.getString(SRI_EMISION_MODO);

    if (this.isAllowed(raw)) {
      return raw;
    }

    await this.fallbackAndAudit(raw);
    return FALLBACK;
  }

  private isAllowed(value: string | null | undefined): value is SriEmisionModo {
    return (
      typeof value === 'string' &&
      (ALLOWED_MODOS as ReadonlyArray<string>).includes(value)
    );
  }

  private async fallbackAndAudit(raw: string | null): Promise<void> {
    const reason = raw === null ? 'missing-key' : 'invalid-value';
    this.logger.warn(
      `[SriEmisionModeService] ${SRI_EMISION_MODO}=${JSON.stringify(
        raw,
      )} is invalid (${reason}); falling back to "${FALLBACK}"`,
    );

    await this.auditService.log({
      accion: 'modo-invalido-fallback',
      recurso: 'sistema-config',
      recursoId: SRI_EMISION_MODO,
      exitoso: false,
      metadata: {
        rawValue: raw,
        fallback: FALLBACK,
        reason,
      },
    });
  }
}
