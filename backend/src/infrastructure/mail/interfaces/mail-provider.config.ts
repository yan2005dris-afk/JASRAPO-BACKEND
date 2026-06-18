import type { ConfigService } from '@nestjs/config';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import type SMTPPool from 'nodemailer/lib/smtp-pool';

export interface MailProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  rateLimit: { maxPerDay: number };
  transport: SMTPTransport.Options | SMTPPool.Options;
}

function parseSmtpPort(portStr: string): number {
  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid SMTP port configuration: ${portStr}`);
  }
  return port;
}

export function buildMailProviders(
  config: ConfigService,
): MailProviderConfig[] {
  const brevoUser = config.get<string>('BREVO_SMTP_USER');
  const brevoPass = config.get<string>('BREVO_SMTP_PASS');
  const gmailUser = config.get<string>('EMAIL_USER');
  const gmailPass = config.get<string>('EMAIL_PASSWORD');

  return [
    {
      name: 'brevo',
      enabled: !!brevoUser && !!brevoPass,
      priority: 1,
      rateLimit: { maxPerDay: 300 },
      transport: {
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        host: config.get('BREVO_SMTP_HOST', 'smtp-relay.brevo.com'),
        port: parseSmtpPort(config.get('BREVO_SMTP_PORT', '587')),
        secure: false,
        auth: {
          user: brevoUser,
          pass: brevoPass,
        },
      },
    },
    {
      name: 'gmail',
      enabled: !!gmailUser && !!gmailPass,
      priority: 2,
      rateLimit: { maxPerDay: 500 },
      transport: {
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        service: config.get('EMAIL_SERVICE', 'gmail'),
        host: config.get('EMAIL_HOST', 'smtp.gmail.com'),
        port: parseSmtpPort(config.get('EMAIL_PORT', '587')),
        secure: config.get('EMAIL_SECURE', 'false') === 'true',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      },
    },
  ];
}
