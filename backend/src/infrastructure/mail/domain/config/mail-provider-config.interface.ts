import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type SMTPPool from 'nodemailer/lib/smtp-pool';

export interface MailProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  strategy: 'failover' | 'round-robin';
  rateLimit: { maxPerDay: number };
  transport: SMTPTransport.Options | SMTPPool.Options;
}
