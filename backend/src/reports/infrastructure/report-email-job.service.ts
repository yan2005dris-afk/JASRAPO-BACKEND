import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { JobsService } from 'src/infrastructure/jobs/jobs.service';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import {
  getPdfEmailIdempotencySeconds,
  getPdfEmailJobTimeoutSeconds,
  getPdfEmailMaxAttachmentBytes,
} from 'src/infrastructure/pdf/pdf-email.config';
import { PdfAttachmentTooLargeException } from 'src/infrastructure/pdf/pdf.exceptions';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import {
  ReportEmailQueue,
  type EnqueueReportEmailParams,
} from '../application/report-email-queue.port';
import type { ReportDocument } from '../application/models/report-projection';
import { ReportStyleDispatcher } from '../application/report-style.dispatcher';
import type { ReportKey } from '../application/report-style.service';

export const REPORT_EMAIL_JOB_NAME = 'generate-report-email';

export interface ReportEmailJobPayload {
  reportType: ReportKey;
  document: ReportDocument;
  destinatario: string;
  subject: string;
  idempotencyKey: string;
}

@Injectable()
export class ReportEmailJobService
  extends ReportEmailQueue
  implements OnModuleInit
{
  private readonly maxAttachmentBytes = getPdfEmailMaxAttachmentBytes();
  private readonly idempotencySeconds = getPdfEmailIdempotencySeconds();
  private readonly jobTimeoutSeconds = getPdfEmailJobTimeoutSeconds();

  constructor(
    private readonly jobsService: JobsService,
    private readonly dispatcher: ReportStyleDispatcher,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.jobsService.work(REPORT_EMAIL_JOB_NAME, async ([job]) => {
      if (job) await this.processJob(job.data as ReportEmailJobPayload);
    });
    this.logger.log(
      `Report PDF email worker listening (job: ${REPORT_EMAIL_JOB_NAME})`,
      ReportEmailJobService.name,
    );
  }

  async enqueue(
    params: EnqueueReportEmailParams,
  ): Promise<{ jobId: string; deduplicated: boolean }> {
    const idempotencyKey = params.idempotencyKey ?? randomUUID();
    const payload: ReportEmailJobPayload = { ...params, idempotencyKey };
    const singletonKey = `report-email:${idempotencyKey}`;

    const jobId = await this.jobsService.send(REPORT_EMAIL_JOB_NAME, payload, {
      singletonKey,
      singletonSeconds: this.idempotencySeconds,
      expireInSeconds: this.jobTimeoutSeconds,
      retryLimit: 2,
      retryDelay: 5,
      retryDelayMax: 60,
      retryBackoff: true,
    });

    return {
      jobId: jobId ?? singletonKey,
      deduplicated: jobId === null,
    };
  }

  async processJob(payload: ReportEmailJobPayload): Promise<void> {
    const { buffer } = await this.dispatcher.dispatch(
      payload.reportType,
      payload.document,
    );
    if (buffer.length > this.maxAttachmentBytes) {
      throw new PdfAttachmentTooLargeException(
        buffer.length,
        this.maxAttachmentBytes,
      );
    }

    await this.mailService.sendReport(
      payload.destinatario,
      payload.subject,
      payload.reportType,
      buffer,
      {
        idempotencyKey: payload.idempotencyKey,
        maxAttachmentBytes: this.maxAttachmentBytes,
      },
    );
  }
}
