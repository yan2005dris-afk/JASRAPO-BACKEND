import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { PdfDocumentType } from '../../infrastructure/pdf/document-type.interface';
import { PdfService } from '../../infrastructure/pdf/pdf.service';
import { buildPdfFileName } from '../../infrastructure/pdf/utils/pdf-format.utils';
import { ReportKey, ReportStyle, ReportStyleService } from './report-style.service';

const VALID_STYLES: readonly ReportStyle[] = ['legacy', 'modern'];

/**
 * Wire the resolved style to the matching pdf-type and render the PDF.
 *
 * Pulls style from `ReportStyleService`, composes the `${reportKey}-${style}`
 * composite key, fetches the `PdfDocumentType`, calls `adaptData(raw)` and
 * hands the result to `PdfService.render`. The returned `{ buffer, filename }`
 * bundle is what the controller pipes to the HTTP response.
 *
 * The dispatcher's job is orchestration only — caching, style resolution and
 * template rendering live in their respective services.
 */
@Injectable()
export class ReportStyleDispatcher {
  private readonly logger = new Logger(ReportStyleDispatcher.name);

  constructor(
    private readonly styles: ReportStyleService,
    private readonly pdfService: PdfService,
  ) {}

  /**
   * Returns the rendered PDF buffer + a PII-safe filename derived from
   * the report key only. `hash` is the explicit base36 timestamp override
   * used by tests; production callers leave it `undefined` so the default
   * `Date.now()`-based hash kicks in.
   */
  async dispatch(
    reportKey: ReportKey,
    raw: Record<string, unknown>,
    hash?: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    let style = await this.styles.resolveStyle(reportKey);

    // Belt-and-suspenders: re-validate after the cache hit in case someone
    // wrote garbage directly into `sistema_config` (REQ-16).
    if (!(VALID_STYLES as readonly string[]).includes(style)) {
      this.logger.warn(
        `Invalid style resolved for "${reportKey}": ${String(style)} — using "legacy"`,
      );
      style = 'legacy';
    }

    const compositeKey = `${reportKey}-${style}`;
    const pdfType = this.pdfService.getDocumentType(compositeKey);
    if (!pdfType) {
      throw new NotFoundException(
        `PDF type "${compositeKey}" not registered. Available: ${this.pdfService
          .getAvailableTypes()
          .join(', ')}`,
      );
    }

    const adapted = pdfType.adaptData(raw);
    const buffer = await this.pdfService.render(pdfType.template, adapted);
    const filename = buildPdfFileName(reportKey, hash);

    return { buffer, filename };
  }
}
