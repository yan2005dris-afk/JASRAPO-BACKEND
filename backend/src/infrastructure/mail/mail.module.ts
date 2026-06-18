import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { NodemailerProvider } from './nodemailer.provider';
import { MailProviderFactory } from './providers/provider.factory';
import { MailRateLimitService } from './mail-rate-limit.service';
import { MailService } from './mail.service';
import { MailQueueService } from './mail-queue.service';
import { MailMetricsController } from './mail-metrics.controller';
import { JobsModule } from '../jobs/jobs.module';

/**
 * MailModule - Gestiona la infraestructura de envío de correos.
 * Usa un enfoque de colas transaccionales sobre PostgreSQL (pg-boss).
 */
@Global()
@Module({
  imports: [
    JobsModule,
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('BREVO_SMTP_HOST', 'smtp-relay.brevo.com'),
          port: parseInt(config.get('BREVO_SMTP_PORT', '587'), 10),
          secure: false,
          auth: {
            user: config.get('BREVO_SMTP_USER'),
            pass: config.get('BREVO_SMTP_PASS'),
          },
        },
        defaults: {
          from: `"${config.get('EMAIL_FROM_NAME', 'JASRAP-Olon')}" <${config.get('EMAIL_FROM', 'no-reply@jasrapo.com')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailMetricsController],
  providers: [
    NodemailerProvider,
    MailRateLimitService,
    MailProviderFactory,
    MailService,
    MailQueueService,
  ],
  exports: [MailService, MailQueueService, MailProviderFactory],
})
export class MailModule {}
