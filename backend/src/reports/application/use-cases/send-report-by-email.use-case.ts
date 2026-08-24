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

export interface SendReportByEmailParams {
  reportType: string;
  filters: unknown;
  destinatarioOverride?: string;
  subjectOverride?: string;
  idempotencyKey?: string;
}

export interface SendReportByEmailResult {
  queued: true;
  jobId: string;
  destinatario: string;
  subject: string;
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
    const strategy = this.strategies[params.reportType as ReportKey];
    if (!strategy) {
      throw new NotFoundException(
        `Report type '${params.reportType}' is not supported for email sending`,
      );
    }

    // Build the typed projection once. The worker receives this exact document
    // and performs only the expensive PDF rendering and mail delivery.
    const report = await strategy.fetchReport(params.filters);
    const derivedRecipient = params.destinatarioOverride
      ? null
      : await strategy.recipientResolver(params.filters, report);
    const destinatario = params.destinatarioOverride ?? derivedRecipient;
    if (!destinatario) {
      throw new BadRequestException(
        'Recipient email is required (no override and no derivation resolved one)',
      );
    }

    const subject =
      params.subjectOverride ?? strategy.subjectBuilder(params.filters);
    const { jobId, deduplicated } = await this.reportEmailJobs.enqueue({
      reportType: params.reportType as ReportKey,
      document: report.document,
      destinatario,
      subject,
      idempotencyKey: params.idempotencyKey,
    });

    this.logger.debug(
      `recipient resolved reportType=${params.reportType}`,
      SendReportByEmailUseCase.name,
    );
    this.logger.log(
      `SendReportByEmailUseCase: ${deduplicated ? 'deduplicated' : 'queued'} ${params.reportType} jobId=${jobId}`,
    );

    return { queued: true, jobId, destinatario, subject };
  }
}
