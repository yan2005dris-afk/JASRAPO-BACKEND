/**
 * `SendReportByEmailUseCase` — generic, strategy-driven email sender for
 * the 5 analytical reports.
 *
 * Design decisions (PR 4, see engram `sdd/report-endpoint-send-email/design`
 * revision 2, observation #1886):
 *
 * 1. **Tiempo máximo de generación (30s).** `page.pdf(...)` de Puppeteer no
 *    propaga esta opción a través del dispatcher. Para no extender el cambio
 *    por todo el flujo de renderizado, la llamada se envuelve aquí con
 *    `withTimeout(...)`. Si se supera el tiempo, se responde con HTTP 503 para
 *    indicar que es un fallo temporal y que el cliente puede reintentar.
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
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { ReportStyleDispatcher } from '../report-style.dispatcher';
import { TimeoutError, withTimeout } from 'src/common/async/with-timeout';
import {
  REPORT_EMAIL_STRATEGIES,
  type ReportEmailStrategyMap,
} from './send-report-by-email.strategies';
import type { ReportKey } from '../report-style.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

export interface SendReportByEmailParams {
  reportType: string;
  filters: unknown;
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

@LogContext()
@Injectable()
export class SendReportByEmailUseCase {
  constructor(
    private readonly mailService: MailService,
    private readonly dispatcher: ReportStyleDispatcher,
    @Inject(REPORT_EMAIL_STRATEGIES)
    private readonly strategies: ReportEmailStrategyMap,
    @Optional()
    private readonly pdfTimeoutMs: number = DEFAULT_PDF_TIMEOUT_MS,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    params: SendReportByEmailParams,
  ): Promise<SendReportByEmailResult> {
    const strategy = this.strategies[params.reportType as ReportKey];
    if (!strategy) {
      throw new NotFoundException(
        `Report type '${params.reportType}' is not supported for email sending`,
      );
    }

    // La definición prepara una sola proyección para resolver el destinatario
    // y generar el PDF sin volver a consultar ni recalcular el reporte.
    const report = await strategy.fetchReport(params.filters);

    // Si llega un destinatario explícito, no hace falta resolver otro.
    const derivedRecipient = params.destinatarioOverride
      ? null
      : await strategy.recipientResolver(params.filters, report);
    const destinatario = params.destinatarioOverride ?? derivedRecipient;

    // PII: surface recipient resolution at DEBUG only. The recipient email
    // must never enter INFO logs at the use-case layer (see header docs).
    this.logger.debug(
      `recipient resolved reportType=${params.reportType}`,
      SendReportByEmailUseCase.name,
    );

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
      const { buffer } = await withTimeout(
        this.dispatcher.dispatch(
          params.reportType as ReportKey,
          report.document,
        ),
        this.pdfTimeoutMs,
        'pdf-generation',
      );
      pdfBuffer = buffer;
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
