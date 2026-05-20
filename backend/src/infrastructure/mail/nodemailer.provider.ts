import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IMailProvider, SendMailOptions, MailResult } from './interfaces/mail-provider.interface';

/**
 * Proveedor de correo basado en Nodemailer.
 * Soporta SMTP (Gmail, SES, Brevo) y plantillas Handlebars.
 */
@Injectable()
export class NodemailerProvider implements IMailProvider {
  private readonly logger = new Logger(NodemailerProvider.name);

  constructor(private readonly mailerService: MailerService) {}

  async send(options: SendMailOptions): Promise<MailResult> {
    try {
      const info = await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
      });

      return {
        messageId: info.messageId,
        success: true,
      };
    } catch (error: any) {
      this.logger.error(`Error enviando correo: ${error.message}`, error.stack);
      return {
        messageId: '',
        success: false,
        error: error.message,
      };
    }
  }
}
