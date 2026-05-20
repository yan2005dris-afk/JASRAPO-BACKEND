import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { NodemailerProvider } from './nodemailer.provider';
import { MailQueueService } from './mail-queue.service';
import { JobsModule } from '../jobs/jobs.module';

/**
 * MailModule - Gestiona la infraestructura de envío de correos.
 * Usa un enfoque de colas transaccionales sobre PostgreSQL (pg-boss).
 */
@Global()
@Module({
  imports: [
    JobsModule,
    // Configuración de Mailer (Nodemailer)
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          service: config.get('EMAIL_SERVICE'), // Opcional (ej: 'gmail')
          host: config.get('EMAIL_HOST', 'localhost'),
          port: config.get('EMAIL_PORT', 587),
          secure: config.get('EMAIL_SECURE', 'false') === 'true',
          auth: {
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASSWORD'),
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
  providers: [NodemailerProvider, MailQueueService],
  exports: [NodemailerProvider, MailQueueService],
})
export class MailModule {}
