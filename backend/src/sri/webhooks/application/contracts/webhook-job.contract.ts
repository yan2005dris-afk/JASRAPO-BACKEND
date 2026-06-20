export const WEBHOOK_DISPATCH_JOB = 'webhook-dispatch';

export interface WebhookJobData {
  configId: string;
  url: string;
  secreto: string;
  evento: string;
  payload: Record<string, unknown>;
}
