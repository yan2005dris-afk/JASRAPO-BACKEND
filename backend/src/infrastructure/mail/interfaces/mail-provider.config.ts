import type { ConfigService } from '@nestjs/config';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface MailProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  rateLimit: { maxPerDay: number };
  transport: SMTPTransport.Options;
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
        host: config.get('BREVO_SMTP_HOST', 'smtp-relay.brevo.com'),
        port: parseInt(config.get('BREVO_SMTP_PORT', '587'), 10),
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
        service: config.get('EMAIL_SERVICE', 'gmail'),
        host: config.get('EMAIL_HOST', 'smtp.gmail.com'),
        port: parseInt(config.get('EMAIL_PORT', '587'), 10),
        secure: config.get('EMAIL_SECURE', 'false') === 'true',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      },
    },
  ];
}
