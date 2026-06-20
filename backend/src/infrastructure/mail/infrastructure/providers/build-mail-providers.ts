import type { ConfigService } from '@nestjs/config';
import type { MailProviderConfig } from '../../domain/config/mail-provider-config.interface';

function parseSmtpPort(portStr: string | undefined, defaultPort = 587): number {
  if (!portStr) return defaultPort;
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
      strategy: 'failover',
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
      strategy: 'failover',
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
