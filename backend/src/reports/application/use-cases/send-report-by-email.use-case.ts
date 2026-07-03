/**
 * `SendReportByEmailUseCase` — generic, strategy-driven email sender for
 * the 5 analytical reports.
 *
 * Design decisions (PR 4, see engram `sdd/report-endpoint-send-email/design`
 * revision 2, observation #1886):
 *
 * 1. **PDF generation timeout (30s).** Puppeteer's `page.pdf(...)` does not
 *    propagate a timeout option through `GeneratePdfUseCase`. Rather than
 *    thread a timeout through the PDF use case (larger blast radius), we
 *    wrap the call in `withTimeout(...)` here and convert the resulting
 *    `TimeoutError` into a `ServiceUnavailableException` (HTTP 503). 503 is
 *    the correct response code for a transient upstream failure and signals
 *    to clients/load balancers that retry is safe.
 *
 * 2. **PII-safe logging.** The use case runs per HTTP request, so the
 *    resolved recipient email is PII. Per design rev 2 (decision #6 / item
 *    PII-LOW) the recipient MUST NOT appear in INFO logs — only DEBUG.
 *    The final queued-log line carries `reportType` + `jobId` only; the
 *    recipient is surfaced at DEBUG with `{ reportType }` so operators
 *    can correlate requests without exfiltrating PII into log aggregators.
 *    The pg-boss worker keeps logging the recipient at INFO because it
 *    runs per job, not per request, and operators need to trace emails.
 *
 * Errors mapped:
 *   - unknown `reportType`           -> NotFoundException (404)
 *   - null recipient after overrides -> BadRequestException (400)
 *   - PDF generation throws          -> rethrows (controller surfaces 500)
 *   - PDF generation exceeds timeout -> ServiceUnavailableException (503)
 *   - MailService.sendReport throws  -> rethrows (controller surfaces 500)
 */
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { TimeoutError, withTimeout } from 'src/common/async/with-timeout';
import {
  REPORT_EMAIL_STRATEGIES,
  type ReportEmailStrategyMap,
} from './send-report-by-email.strategies';

export interface SendReportByEmailParams {
  reportType: string;
  filters: Record<string, unknown>;
  destinatarioOverride?: string;
  subjectOverride?: string;
}

export interface SendReportByEmailResult {
  queued: true;
  jobId: string;
  destinatario: string;
  subject: string;
}

/**
 * Default PDF generation timeout. Overrideable per-instance via the 4th
 * constructor parameter (used by tests; production keeps the default).
 */
export const DEFAULT_PDF_TIMEOUT_MS = 30_000;

@Injectable()
export class SendReportByEmailUseCase {
  private readonly logger = new Logger(SendReportByEmailUseCase.name);

  constructor(
    private readonly mailService: MailService,
    private readonly generatePdf: GeneratePdfUseCase,
    @Inject(REPORT_EMAIL_STRATEGIES)
    private readonly strategies: ReportEmailStrategyMap,
    @Optional()
    private readonly pdfTimeoutMs: number = DEFAULT_PDF_TIMEOUT_MS,
  ) {}

  async execute(
    params: SendReportByEmailParams,
  ): Promise<SendReportByEmailResult> {
    const strategy = this.strategies[params.reportType];
    if (!strategy) {
      throw new NotFoundException(
        `Report type '${params.reportType}' is not supported for email sending`,
      );
    }

    // Pull spec data first — it's needed both by the recipient resolver
    // (account-statement prefers the already-loaded contrato.cliente.email)
    // and by the PDF renderer (templates expect the spec output shape, not
    // the raw filters).
    const specData = await strategy.fetchSpec(params.filters);

    // SUG #1 fix: skip the recipient lookup when an override is supplied so
    // we never hit the DB unnecessarily.
    const derivedRecipient = params.destinatarioOverride
      ? null
      : await strategy.recipientResolver(params.filters, specData);
    const destinatario = params.destinatarioOverride ?? derivedRecipient;

    // PII: surface recipient resolution at DEBUG only. The recipient email
    // must never enter INFO logs at the use-case layer (see header docs).
    this.logger.debug({ reportType: params.reportType }, 'recipient resolved');

    if (!destinatario) {
      throw new BadRequestException(
        'Recipient email is required (no override and no derivation resolved one)',
      );
    }

    const subject =
      params.subjectOverride ?? strategy.subjectBuilder(params.filters);

    // Wrap PDF generation in a 30s timeout. On overrun we surface 503
    // (transient upstream failure, retryable). The original pdf promise is
    // abandoned but the underlying Puppeteer call still resolves eventually;
    // we accept the leaked work as a low-cost tradeoff vs. plumbing a
    // cancellation token through Puppeteer.
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await withTimeout(
        this.generatePdf.execute(params.reportType, specData),
        this.pdfTimeoutMs,
        'pdf-generation',
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new ServiceUnavailableException('PDF generation timeout');
      }
      throw err;
    }

    const { jobId } = await this.mailService.sendReport(
      destinatario,
      subject,
      params.reportType,
      pdfBuffer,
    );

    // PII-safe INFO line: reportType + jobId only. The recipient is logged
    // at DEBUG above (per-request correlation, not in INFO aggregators).
    this.logger.log(
      `SendReportByEmailUseCase: queued ${params.reportType} jobId=${jobId}`,
    );

    return {
      queued: true,
      jobId,
      destinatario,
      subject,
    };
  }
}
