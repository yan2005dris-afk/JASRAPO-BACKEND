import type { ReportKey } from './report-style.service';
import type { ReportDocument } from './models/report-projection';

export interface EnqueueReportEmailParams {
  reportType: ReportKey;
  document: ReportDocument;
  destinatario: string;
  subject: string;
  idempotencyKey?: string;
}

export interface EnqueuedReportEmail {
  jobId: string;
  deduplicated: boolean;
}

export abstract class ReportEmailQueue {
  abstract enqueue(
    params: EnqueueReportEmailParams,
  ): Promise<EnqueuedReportEmail>;
}
