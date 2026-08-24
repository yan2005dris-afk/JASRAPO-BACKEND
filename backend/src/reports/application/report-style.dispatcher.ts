import { Injectable, NotFoundException } from '@nestjs/common';
import { PdfService } from '../../infrastructure/pdf/pdf.service';
import { buildPdfFileName } from '../../infrastructure/pdf/utils/pdf-format.utils';
import {
  ReportKey,
  ReportStyle,
  ReportStyleService,
} from './report-style.service';
import {
  getAllowedStyles,
  isCanonicalOnly,
  isStyleAllowed,
} from './report-style.catalog';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import type { ReportDocument } from './models/report-projection';

/**
 * Wire the resolved style to the matching pdf-type and render the PDF.
 *
 * Las familias con dos estilos se resuelven con la clave
 * `${reportKey}-${style}`. Las familias canónicas usan directamente
 * `reportKey`. Después adapta solo detalles de presentación y renderiza el PDF.
 *
 * The dispatcher's job is orchestration only — caching, style resolution and
 * template rendering live in their respective services.
 */
@LogContext()
@Injectable()
export class ReportStyleDispatcher {
  constructor(
    private readonly styles: ReportStyleService,
    private readonly pdfService: PdfService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Returns the rendered PDF buffer + a PII-safe filename derived from
   * the report key only. `hash` is the explicit base36 timestamp override
   * used by tests; production callers leave it `undefined` so the default
   * `Date.now()`-based hash kicks in.
   */
  async dispatch(
    reportKey: ReportKey,
    document: ReportDocument,
    hash?: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const allowed = getAllowedStyles(reportKey);
    if (allowed.length === 0) {
      throw new NotFoundException(
        `No styles declared for report "${reportKey}" in the report-style catalog.`,
      );
    }

    const style = await this.resolveAllowedStyle(reportKey, allowed);

    const documentTypeKey = isCanonicalOnly(reportKey)
      ? reportKey
      : `${reportKey}-${style}`;
    const pdfType = this.pdfService.getDocumentType<ReportDocument, object>(
      documentTypeKey,
    );
    if (!pdfType) {
      throw new NotFoundException(
        `PDF type "${documentTypeKey}" not registered. Available: ${this.pdfService
          .getAvailableTypes()
          .join(', ')}`,
      );
    }

    const adapted = pdfType.adaptData(document);
    const buffer = await this.pdfService.render(pdfType.template, adapted);
    const filename = buildPdfFileName(reportKey, hash);

    return { buffer, filename };
  }

  /**
   * Resolve the style to render `reportKey` with, validated against the
   * report-style catalog (`allowed`).
   *
   *  - Canonical-only families (`['unique']`) ALWAYS use their single
   *    declared style and never read the global `reporte.estilo`. This is
   *    what keeps legal/contractual docs on one official template regardless
   *    of the global config.
   *  - Dual-style families resolve `legacy` | `modern` from
   *    `ReportStyleService`, then re-validate against the catalog: anything
   *    not declared (a corrupted config row, or a style this family does not
   *    support) falls back to the family's first allowed style with a warn.
   */
  private async resolveAllowedStyle(
    reportKey: ReportKey,
    allowed: readonly ReportStyle[],
  ): Promise<ReportStyle> {
    if (isCanonicalOnly(reportKey)) {
      return allowed[0];
    }

    const resolved = await this.styles.resolveStyle(reportKey);
    if (isStyleAllowed(reportKey, resolved)) {
      return resolved;
    }

    const fallback = allowed[0];
    this.logger.warn(
      `Invalid style "${String(resolved)}" for "${reportKey}" — not in [${allowed.join(
        ', ',
      )}], using "${fallback}"`,
    );
    return fallback;
  }
}
