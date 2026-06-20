import type * as nodemailer from 'nodemailer';
import type { MailProviderConfig } from '../config/mail-provider-config.interface';

export interface MailAttachment {
  filename: string;
  content?: Buffer | string; // Opcional — puede venir de url
  url?: string;
  contentType?: string;
}

export interface SendMailOptions {
  version?: 1 | 2;
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  text?: string;
  html?: string;
  attachments?: MailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface MailResult {
  messageId: string;
  success: boolean;
  error?: string;
}

/**
 * Interface para las estrategias de envío de correos.
 * Las implementaciones definen cómo se intentan múltiples proveedores (failover, round-robin, etc.)
 */
export interface MailDispatcher {
  send(
    mailOptions: nodemailer.SendMailOptions,
    providers: MailProviderConfig[],
  ): Promise<MailResult>;
}

/**
 * Interfaz genérica para proveedores de correo.
 * Permite intercambiar AWS SES, Mailgun, Nodemailer SMTP, etc.
 */
export interface IMailProvider {
  send(options: SendMailOptions): Promise<MailResult>;
}
