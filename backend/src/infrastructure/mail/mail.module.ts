import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { NodemailerProvider } from './infrastructure/providers/nodemailer.provider';
import { MailProviderFactory } from './infrastructure/providers/provider.factory';
import { FailoverDispatcher } from './infrastructure/dispatchers/failover.dispatcher';
import { RoundRobinDispatcher } from './infrastructure/dispatchers/round-robin.dispatcher';
import { MailRateLimitService } from './infrastructure/rate-limit/mail-rate-limit.service';
import { MailService } from './application/mail.service';
import { MailQueueService } from './infrastructure/queue/mail-queue.service';
import { MailMetricsController } from './interfaces/http/mail-metrics.controller';
import { JobsModule } from '../jobs/jobs.module';
import { buildMailProviders } from './infrastructure/providers/build-mail-providers';
import type { MailDispatcher } from './domain/interfaces/mail-provider.interface';

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
    FailoverDispatcher,
    RoundRobinDispatcher,
    {
      provide: 'MAIL_DISPATCHER',
      useFactory: (
        configService: ConfigService,
        failover: FailoverDispatcher,
        roundRobin: RoundRobinDispatcher,
      ): MailDispatcher => {
        const providers = buildMailProviders(configService);
        const strategy = providers[0]?.strategy ?? 'failover';
        return strategy === 'round-robin' ? roundRobin : failover;
      },
      inject: [ConfigService, FailoverDispatcher, RoundRobinDispatcher],
    },
    MailProviderFactory,
    MailService,
    MailQueueService,
  ],
  exports: [
    MailService,
    MailQueueService,
    MailProviderFactory,
    FailoverDispatcher,
    RoundRobinDispatcher,
  ],
})
export class MailModule {}
