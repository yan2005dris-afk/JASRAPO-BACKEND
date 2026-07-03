import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import type { ReportEmailStrategy } from './send-report-by-email.strategy';

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
 * Default stub strategies. Each entry returns `null` from `recipientResolver`
 * and a placeholder subject so the skeleton compiles and tests pass without
 * reaching into real report specs (those land in PR 2).
 *
 * Tests inject a custom strategies map via the third constructor argument.
 */
const DEFAULT_STUB_STRATEGIES: Record<
  string,
  ReportEmailStrategy<Record<string, unknown>>
> = {
  'payments-report': {
    reportType: 'payments-report',
    recipientResolver: () => null,
    subjectBuilder: () => '<payments-report report>',
  },
  'connection-history': {
    reportType: 'connection-history',
    recipientResolver: () => null,
    subjectBuilder: () => '<connection-history report>',
  },
  'payment-agreement': {
    reportType: 'payment-agreement',
    recipientResolver: () => null,
    subjectBuilder: () => '<payment-agreement report>',
  },
  'account-statement': {
    reportType: 'account-statement',
    recipientResolver: () => null,
    subjectBuilder: () => '<account-statement report>',
  },
  'clients-list': {
    reportType: 'clients-list',
    recipientResolver: () => null,
    subjectBuilder: () => '<clients-list report>',
  },
};

/**
 * Generic, strategy-driven use case that emails any of the 5 analytical reports.
 *
 * Lifecycle:
 *   PR 1 (this commit) — skeleton + stub strategies + tests for the orchestrating
 *     flow (recipient resolution, subject building, error envelopes).
 *   PR 2 — replaces the stub strategies with real `recipientResolver`/`subjectBuilder`
 *     implementations per route.
 *   PR 3 — controller @Post handlers call `execute(...)` with route-specific filters.
 *   PR 4 — wraps `generatePdf.execute(...)` with a 30s timeout and demotes the
 *     recipient log to debug.
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
  private readonly strategies: Record<
    string,
    ReportEmailStrategy<Record<string, unknown>>
  >;

  constructor(
    private readonly mailService: MailService,
    private readonly generatePdf: GeneratePdfUseCase,
    strategies?: Record<string, ReportEmailStrategy<Record<string, unknown>>>,
  ) {
    this.strategies = strategies ?? DEFAULT_STUB_STRATEGIES;
  }

  async execute(
    params: SendReportByEmailParams,
  ): Promise<SendReportByEmailResult> {
    const strategy = this.strategies[params.reportType];
    if (!strategy) {
      throw new NotFoundException(
        `Report type '${params.reportType}' is not supported for email sending`,
      );
    }

    const derivedRecipient = await strategy.recipientResolver(params.filters);
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
      params.filters,
    );

    const { jobId } = await this.mailService.sendReport(
      destinatario,
      subject,
      params.reportType,
      pdfBuffer,
    );

    this.logger.log(
      `Queued ${params.reportType} email — recipients: 1, jobId returned by pg-boss`,
    );

    return {
      queued: true,
      jobId,
      destinatario,
      subject,
    };
  }
}
