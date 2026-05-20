export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  template?: string; // Nombre de la plantilla (Handlebars/EJS)
  context?: Record<string, any>; // Datos para la plantilla
  text?: string; // Fallback en texto plano
  html?: string; // HTML directo si no se usa template
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
 * Interfaz genérica para proveedores de correo.
 * Permite intercambiar AWS SES, Mailgun, Nodemailer SMTP, etc.
 */
export interface IMailProvider {
  send(options: SendMailOptions): Promise<MailResult>;
}
