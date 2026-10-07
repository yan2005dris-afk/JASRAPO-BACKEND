import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Readable } from 'stream';
import { buildMailProviders } from './build-mail-providers';
import type { MailProviderConfig } from '../../domain/config/mail-provider-config.interface';
import type {
  MailDispatcher,
  MailResult,
  SendMailOptions,
} from '../../domain/interfaces/mail-provider.interface';
import { MailRateLimitService } from '../rate-limit/mail-rate-limit.service';
import { StorageService } from '../../../storage/storage.service';
import { MAIL_TEMPLATES } from '../templates/mail-templates';

const S3_URL_REGEX = /^s3:\/\/([^/]+)\/(.+)$/;

@Injectable()
export class MailProviderFactory {
  private readonly logger = new Logger(MailProviderFactory.name);
  private readonly providers: MailProviderConfig[];
  private readonly transporters = new Map<string, nodemailer.Transporter>();

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimitService: MailRateLimitService,
    @Optional() private readonly storageService?: StorageService,
    @Optional()
    @Inject('MAIL_DISPATCHER')
    private readonly dispatcher?: MailDispatcher,
  ) {
    this.providers = buildMailProviders(configService);
  }

  async send(options: SendMailOptions): Promise<MailResult> {
    const enabledProviders = this.providers
      .filter((provider) => provider.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (enabledProviders.length === 0) {
      return {
        messageId: '',
        success: false,
        error: 'No mail providers configured',
      };
    }

    let mailOptions: nodemailer.SendMailOptions;
    try {
      mailOptions = await this.buildMailOptions(options);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown template error';
      return {
        messageId: '',
        success: false,
        error: message,
      };
    }

    // Delegate to MailDispatcher when available (production path)
    if (this.dispatcher) {
      return this.dispatcher.send(mailOptions, enabledProviders);
    }

    // Fallback inline loop (backward compat for tests without MailDispatcher)
    return this.sendWithInlineLoop(mailOptions, enabledProviders, options);
  }

  /**
   * Inline priority-failover loop — used when no MailDispatcher is injected.
   * Kept for backward compat with existing tests.
   */
  private async sendWithInlineLoop(
    mailOptions: nodemailer.SendMailOptions,
    enabledProviders: MailProviderConfig[],
    originalOptions: SendMailOptions,
  ): Promise<MailResult> {
    for (const provider of enabledProviders) {
      const acquired = await this.rateLimitService.tryAcquire(
        provider.name,
        provider.rateLimit.maxPerDay,
      );

      if (!acquired) {
        this.logger.warn(
          `${provider.name} reached daily limit, trying next provider`,
        );
        continue;
      }

      try {
        const transporter = this.getTransporter(provider);
        const info = await transporter.sendMail(mailOptions);
        this.logger.log(
          `Email sent via ${provider.name} to ${this.formatRecipientsForLog(originalOptions.to)}`,
        );
        return {
          messageId: info.messageId ?? '',
          success: true,
        };
      } catch (error: unknown) {
        await this.rateLimitService.release(provider.name);
        const message =
          error instanceof Error ? error.message : 'Unknown provider error';
        this.logger.warn(`${provider.name} failed: ${message}`);
      }
    }

    return {
      messageId: '',
      success: false,
      error: 'All mail providers failed',
    };
  }

  private getTransporter(provider: MailProviderConfig): nodemailer.Transporter {
    let transporter = this.transporters.get(provider.name);
    if (!transporter) {
      transporter = nodemailer.createTransport({
        connectionTimeout: 10000,
        socketTimeout: 15000,
        greetingTimeout: 5000,
        ...provider.transport,
      });
      this.transporters.set(provider.name, transporter);
    }
    return transporter;
  }

  private async buildMailOptions(
    options: SendMailOptions,
  ): Promise<nodemailer.SendMailOptions> {
    const fromName = this.configService.get('EMAIL_FROM_NAME', 'JASRAP-Olon');
    const fromEmail = this.configService.get(
      'EMAIL_FROM',
      'no-reply@jasrapo.com',
    );

    const attachments = options.attachments
      ? await Promise.all(
          options.attachments.map(async (attachment) => {
            // si la url está presente y el contenido no, se descarga de S3 (defensa en profundidad)
            if (attachment.url && !attachment.content) {
              try {
                let content: Buffer;

                if (attachment.url.startsWith('http')) {
                  // URL pre-firmada HTTP — obtener directamente
                  this.logger.debug(
                    `Descargando adjunto desde URL HTTP en buildMailOptions`,
                  );
                  const response = await fetch(attachment.url);
                  if (!response.ok) {
                    throw new Error(
                      `HTTP ${response.status}: ${response.statusText}`,
                    );
                  }
                  content = Buffer.from(await response.arrayBuffer());
                } else if (this.storageService) {
                  const { bucket, key } = this.parseS3Url(attachment.url);
                  const stream = await this.storageService.getObject(
                    bucket,
                    key,
                  );
                  content = await this.streamToBuffer(stream);
                } else {
                  throw new Error(
                    'No StorageService disponible para resolver URL S3',
                  );
                }

                return {
                  filename: attachment.filename,
                  content,
                  contentType: attachment.contentType,
                };
              } catch (error: unknown) {
                const message =
                  error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(
                  `Fallo al descargar el adjunto desde la URL S3 en buildMailOptions: ${message}`,
                );
                // Fall through: incluir contenido vacío para que el envío falle visiblemente
              }
            }

            // Reconstrucción de Buffer heredada ({type:'Buffer', data:[...]})
            let content = attachment.content as any;
            if (
              content &&
              typeof content === 'object' &&
              content.type === 'Buffer' &&
              Array.isArray(content.data)
            ) {
              content = Buffer.from(content.data);
            }
            return {
              filename: attachment.filename,
              content,
              contentType: attachment.contentType,
            };
          }),
        )
      : undefined;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      text: options.text,
      html: options.html,
      attachments,
    };

    if (options.template) {
      mailOptions.html = this.renderTemplate(
        options.template,
        options.context ?? {},
      );
    }

    return mailOptions;
  }

  /**
   * Analiza una URL S3 del formato s3://bucket/key
   */
  private parseS3Url(url: string): { bucket: string; key: string } {
    const match = S3_URL_REGEX.exec(url);
    if (!match) {
      throw new Error(`Formato de URL S3 inválido: ${url}`);
    }
    return { bucket: match[1], key: match[2] };
  }

  /**
   * Convierte un Readable stream a Buffer
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): string {
    const templateFn = MAIL_TEMPLATES[templateName];
    if (!templateFn) {
      throw new Error(`Plantilla de correo desconocida: ${templateName}`);
    }
    return templateFn(context);
  }

  private formatRecipientsForLog(to: string | string[]): string {
    const recipients = Array.isArray(to) ? to : [to];
    return recipients.map((email) => this.maskEmail(email)).join(', ');
  }

  private maskEmail(email: string): string {
    const trimmed = email.trim();
    const atIndex = trimmed.lastIndexOf('@');

    if (atIndex <= 0) {
      return '***';
    }

    const localPart = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex + 1);
    const maskedLocal = localPart.length <= 1 ? '*' : `${localPart[0]}***`;

    return `${maskedLocal}@${domain}`;
  }
}
