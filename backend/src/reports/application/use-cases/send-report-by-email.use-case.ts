import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
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
 * Generic, strategy-driven use case that emails any of the 5 analytical reports.
 *
 * PR 2 changes from the skeleton:
 *   - strategies injected via `@Inject(REPORT_EMAIL_STRATEGIES)` token (built
 *     in `reports.module.ts` via `useFactory`). The use case no longer carries
 *     a fallback stub map — production wiring always supplies real strategies.
 *   - skips `recipientResolver` when `destinatarioOverride` is provided
 *     (SUG #1 from PR 1 gate review).
 *   - calls `strategy.fetchSpec(filters)` and passes the spec data to
 *     `GeneratePdfUseCase.execute` instead of the raw filters — the PDF
 *     templates expect the spec output shape (e.g. `pagos`, `fechaDesde`).
 *   - log line surfaces the actual `jobId` + recipient instead of a placeholder
 *     (SUG #2 from PR 1 gate review).
 *   - `account-statement`'s resolver receives `(filters, specData)` so it can
 *     prefer the email already on the loaded contrato and skip a redundant DB
 *     query.
 *
 * Errors mapped:
 *   - unknown `reportType`           -> NotFoundException (404)
 *   - null recipient after overrides -> BadRequestException (400)
 *   - PDF generation throws          -> rethrows (controller surfaces 500)
 *   - MailService.sendReport throws  -> rethrows (controller surfaces 500)
 */
@Injectable()
export class SendReportByEmailUseCase {
  private readonly logger = new Logger(SendReportByEmailUseCase.name);

  constructor(
    private readonly mailService: MailService,
    private readonly generatePdf: GeneratePdfUseCase,
    @Inject(REPORT_EMAIL_STRATEGIES)
    private readonly strategies: ReportEmailStrategyMap,
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

    if (!destinatario) {
      throw new BadRequestException(
        'Recipient email is required (no override and no derivation resolved one)',
      );
    }

    const subject =
      params.subjectOverride ?? strategy.subjectBuilder(params.filters);

    const pdfBuffer = await this.generatePdf.execute(
      params.reportType,
      specData,
    );

    const { jobId } = await this.mailService.sendReport(
      destinatario,
      subject,
      params.reportType,
      pdfBuffer,
    );

    // SUG #2 fix: surface the real jobId + recipient + report type so log
    // scrapers and operators have something greppable.
    this.logger.log(
      `SendReportByEmailUseCase: queued ${params.reportType} -> ${destinatario} jobId=${jobId}`,
    );

    return {
      queued: true,
      jobId,
      destinatario,
      subject,
    };
  }
}
