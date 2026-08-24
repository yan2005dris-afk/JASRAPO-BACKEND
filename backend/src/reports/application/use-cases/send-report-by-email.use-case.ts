import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { ReportEmailQueue } from '../report-email-queue.port';
import type { ReportKey } from '../report-style.service';
import {
  REPORT_EMAIL_STRATEGIES,
  type ReportEmailStrategyMap,
} from './send-report-by-email.strategies';
import {
  summarizeReportRequestContext,
  type ReportRequestContext,
  type ReportRequestContextSummary,
} from '../models/report-request-context';

export interface SendReportByEmailParams {
  context: ReportRequestContext;
  destinatarioOverride?: string;
  subjectOverride?: string;
  idempotencyKey?: string;
}

export interface SendReportByEmailResult {
  queued: true;
  jobId: string;
  destinatario: string;
  subject: string;
  context: ReportRequestContextSummary;
}

@LogContext()
@Injectable()
export class SendReportByEmailUseCase {
  constructor(
    private readonly reportEmailJobs: ReportEmailQueue,
    @Inject(REPORT_EMAIL_STRATEGIES)
    private readonly strategies: ReportEmailStrategyMap,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    params: SendReportByEmailParams,
  ): Promise<SendReportByEmailResult> {
    const { context } = params;
    const reportType = context.reportType as ReportKey;
    const strategy = this.strategies[reportType];
    if (!strategy) {
      throw new NotFoundException(
        `Report type '${context.reportType}' is not supported for email sending`,
      );
    }

    // Build the typed projection once with the normalized context.
    const report = await strategy.fetchReport(context);

    const derivedRecipient = params.destinatarioOverride
      ? null
      : await strategy.recipientResolver(context, report);
    const destinatario = params.destinatarioOverride ?? derivedRecipient;

    // PII: surface recipient resolution at DEBUG only.
    this.logger.debug(
      `recipient resolved reportType=${context.reportType}`,
      SendReportByEmailUseCase.name,
    );

    if (!destinatario) {
      throw new BadRequestException(
        'Recipient email is required (no override and no derivation resolved one)',
      );
    }

    const subject = params.subjectOverride ?? strategy.subjectBuilder(context);
    const { jobId, deduplicated } = await this.reportEmailJobs.enqueue({
      reportType,
      document: report.document,
      destinatario,
      subject,
      idempotencyKey: params.idempotencyKey,
    });

    this.logger.log(
      `SendReportByEmailUseCase: ${deduplicated ? 'deduplicated' : 'queued'} ${context.reportType} jobId=${jobId}`,
    );

    return {
      queued: true,
      jobId,
      destinatario,
      subject,
      context: summarizeReportRequestContext(context),
    };
  }
}
