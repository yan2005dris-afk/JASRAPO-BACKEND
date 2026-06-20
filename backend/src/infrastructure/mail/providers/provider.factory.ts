import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { join } from 'path';
import {
  buildMailProviders,
  type MailProviderConfig,
} from '../interfaces/mail-provider.config';
import type {
  MailResult,
  SendMailOptions,
} from '../interfaces/mail-provider.interface';
import { MailRateLimitService } from '../mail-rate-limit.service';

@Injectable()
export class MailProviderFactory {
  private readonly logger = new Logger(MailProviderFactory.name);
  private readonly providers: MailProviderConfig[];
  private readonly transporters = new Map<string, nodemailer.Transporter>();
  private readonly templateCache = new Map<
    string,
    HandlebarsTemplateDelegate
  >();

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimitService: MailRateLimitService,
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
          `Email sent via ${provider.name} to ${this.formatRecipientsForLog(options.to)}`,
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

  private getTransporter(
    provider: MailProviderConfig,
  ): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
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

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      text: options.text,
      html: options.html,
      attachments: options.attachments?.map((attachment) => {
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
    };

    if (options.template) {
      mailOptions.html = this.renderTemplate(
        options.template,
        options.context ?? {},
      );
    }

    return mailOptions;
  }

  private renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): string {
    let template = this.templateCache.get(templateName);
    if (!template) {
      const templatePath = join(
        __dirname,
        '..',
        'templates',
        `${templateName}.hbs`,
      );
      const source = readFileSync(templatePath, 'utf8');
      template = Handlebars.compile(source);
      this.templateCache.set(templateName, template);
    }
    return template(context);
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
