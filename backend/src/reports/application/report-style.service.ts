import { Injectable, Logger } from '@nestjs/common';
import { SistemaConfigService } from '../../infrastructure/config/sistema-config.service';
import {
  REPORTE_ESTILO_DEFAULT,
  REPORTE_ESTILO_PAYMENTS_REPORT,
  REPORTE_ESTILO_CONNECTION_HISTORY,
  REPORTE_ESTILO_PAYMENT_AGREEMENT,
} from '../../infrastructure/config/sistema-config.keys';

/**
 * The finite set of report-key slugs the dispatcher knows how to route.
 * Keep this enum-style union tight — every entry must have a matching
 * `reporte.estilo.<key>` row in `sistema_config` (or rely on the
 * `reporte.estilo.default` fallback).
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
 * Hard-coded last-resort fallback when both the per-report key and the
 * `reporte.estilo.default` key are missing or invalid in `sistema_config`.
 * Per locked user decision #5 in
 * `sdd/report-style-system-config/decisions`: silent fallback with a warn log.
 */
const FALLBACK_STYLE: ReportStyle = 'legacy';

const VALID_STYLES: readonly ReportStyle[] = ['legacy', 'modern'];

const REPORT_KEY_TO_CLAVE: Readonly<Record<ReportKey, string>> = {
  'payments-report': REPORTE_ESTILO_PAYMENTS_REPORT,
  'connection-history': REPORTE_ESTILO_CONNECTION_HISTORY,
  'payment-agreement': REPORTE_ESTILO_PAYMENT_AGREEMENT,
};

/**
 * Resolves the report style (`legacy` | `modern`) for a given report key
 * by reading the matching `reporte.estilo.<key>` row in `sistema_config`,
 * with a three-level fallback chain:
 *
 *  1. `reporte.estilo.<reportKey>` (specific)
 *  2. `reporte.estilo.default` (generic fallback)
 *  3. Hard-coded `'legacy'` + `Logger.warn` (last resort)
 *
 * Cache TTL (60s) and `null`-caching are owned by `SistemaConfigService`,
 * so this service stays pure and stateless — it only adds:
 *  - the `reporte.estilo.<key>` → clave resolution
 *  - the three-level fallback chain
 *  - the `IsIn(['legacy','modern'])` validation
 *
 * The dispatcher re-validates after a cache hit (REQ-16 belt-and-suspenders).
 */
@Injectable()
export class ReportStyleService {
  private readonly logger = new Logger(ReportStyleService.name);

  constructor(private readonly config: SistemaConfigService) {}

  /**
   * Returns the resolved style for a given report key. Never throws —
   * invalid / missing config rows always resolve to `'legacy'` with a
   * warn log so a misconfigured deploy renders something instead of 5xx.
   */
  async resolveStyle(reportKey: ReportKey): Promise<ReportStyle> {
    const specificClave = REPORT_KEY_TO_CLAVE[reportKey];
    const specific = await this.config.getString(specificClave);
    if (this.isValid(specific)) {
      return specific;
    }

    const generic = await this.config.getString(REPORTE_ESTILO_DEFAULT);
    if (this.isValid(generic)) {
      return generic;
    }

    this.logger.warn(
      `No valid estilo in sistema_config for "${reportKey}" — falling back to "${FALLBACK_STYLE}"`,
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
