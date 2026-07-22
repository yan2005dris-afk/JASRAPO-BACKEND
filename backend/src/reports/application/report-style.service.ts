import { Injectable } from '@nestjs/common';
import { SistemaConfigService } from '../../infrastructure/config/sistema-config.service';
import { REPORTE_ESTILO } from '../../infrastructure/config/sistema-config.keys';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

/**
 * The finite set of report-key slugs the dispatcher knows how to route.
 * Kept as a typed union for callers' compile-time safety, but the
 * dispatcher no longer uses the key to look up a per-report estilo
 * (see `ReportStyleService` — one global `reporte.estilo` applies to
 * all reports now).
 */
export type ReportKey =
  | 'payments-report'
  | 'connection-history'
  | 'payment-agreement';

/**
 * Style resolved for a given report. Maps 1:1 to the set of pdf-type
 * suffixes (`*-legacy` | `*-modern`) registered with `PdfService`.
 */
export type ReportStyle = 'legacy' | 'modern';

/**
 * Hard-coded last-resort fallback when the `reporte.estilo` row is missing
 * or invalid in `sistema_config`. Per locked user decision #5 in
 * `sdd/report-style-system-config/decisions`: silent fallback with a warn log.
 */
const FALLBACK_STYLE: ReportStyle = 'legacy';

const VALID_STYLES: readonly ReportStyle[] = ['legacy', 'modern'];

/**
 * Resolves the report style (`legacy` | `modern`) by reading the single
 * `reporte.estilo` row in `sistema_config`. The `reportKey` argument is
 * accepted for backwards compatibility with the dispatcher call site
 * but is no longer used to look up a per-report value.
 *
 * Two-level fallback chain:
 *
 *  1. `reporte.estilo` (the one global row)
 *  2. Hard-coded `'legacy'` + `Logger.warn` (last resort)
 *
 * Cache TTL (60s) and `null`-caching are owned by `SistemaConfigService`,
 * so this service stays pure and stateless — it only adds:
 *  - the `IsIn(['legacy','modern'])` validation
 *  - the fallback to the hard-coded legacy
 *
 * The dispatcher re-validates after a cache hit (REQ-16 belt-and-suspenders).
 *
 * Future per-report overrides: introduce a `reporte.estilo.overrides.<key>`
 * row family with an explicit lookup here. Do NOT reintroduce the silent
 * per-key + default chain — that masked misconfiguration.
 */
@LogContext()
@Injectable()
export class ReportStyleService {
  constructor(
    private readonly config: SistemaConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Returns the resolved style. Never throws — invalid / missing config
   * always resolves to `'legacy'` with a warn log so a misconfigured deploy
   * renders something instead of 5xx.
   */
  async resolveStyle(_reportKey: ReportKey): Promise<ReportStyle> {
    const value = await this.config.getString(REPORTE_ESTILO);
    if (this.isValid(value)) {
      return value;
    }

    this.logger.warn(
      `No valid value for "${REPORTE_ESTILO}" in sistema_config (got "${String(value)}") — falling back to "${FALLBACK_STYLE}"`,
    );
    return FALLBACK_STYLE;
  }

  private isValid(value: string | null): value is ReportStyle {
    return (
      typeof value === 'string' &&
      (VALID_STYLES as readonly string[]).includes(value)
    );
  }
}
