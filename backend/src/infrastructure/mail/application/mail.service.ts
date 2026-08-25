import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { MailProviderFactory } from '../infrastructure/providers/provider.factory';
import { MailQueueService } from '../infrastructure/queue/mail-queue.service';
import { StorageService } from '../../storage/storage.service';
import type {
  MailAttachment,
  MailResult,
  SendMailOptions,
} from '../domain/interfaces/mail-provider.interface';
import {
  getPdfEmailIdempotencySeconds,
  getPdfEmailMaxAttachmentBytes,
} from '../../pdf/pdf-email.config';
import { PdfAttachmentTooLargeException } from '../../pdf/pdf.exceptions';

export const PLANILLA_BATCH_SIZE = 25;
const PLANILLA_STORAGE_BUCKET = 'sri-pdfs';

export interface SendReportOptions {
  idempotencyKey?: string;
  maxAttachmentBytes?: number;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly providerFactory: MailProviderFactory,
    private readonly queueService: MailQueueService,
    @Optional() private readonly storageService?: StorageService,
  ) {}

  async send(options: SendMailOptions): Promise<MailResult> {
    return this.providerFactory.send(options);
  }

  async sendQueued(options: SendMailOptions): Promise<string> {
    const jobId = await this.queueService.queueMail(options);
    if (!jobId) {
      throw new InternalServerErrorException('Mail queue rejected the email');
    }
    return jobId;
  }

  async sendBulkPlanillas(mails: SendMailOptions[]): Promise<void> {
    await this.queueService.queueBulkMails(mails);
  }

  /**
   * Enqueues a generic analytical report (PDF) for delivery via the existing
   * pg-boss `send-mail` worker. Uses `version: 2` with an inline Buffer
   * attachment — matches `sendPlanilla`'s fallback path so the worker's
   * `resolveAttachments` branch picks the `content` arm.
   *
   * Returns the pg-boss jobId once accepted. With an idempotency key, a null
   * result means the delivery already exists and returns its stable singleton
   * identity. Without idempotency, null remains an operational error.
   */
  async sendReport(
    to: string,
    subject: string,
    reportType: string,
    pdfBuffer: Buffer,
    sendOptions: SendReportOptions = {},
  ): Promise<{ jobId: string }> {
    const maxAttachmentBytes =
      sendOptions.maxAttachmentBytes ?? getPdfEmailMaxAttachmentBytes();
    if (pdfBuffer.length > maxAttachmentBytes) {
      throw new PdfAttachmentTooLargeException(
        pdfBuffer.length,
        maxAttachmentBytes,
      );
    }

    const options: SendMailOptions = {
      version: 2,
      to,
      subject,
      template: 'generic-report',
      context: { reportType },
      attachments: [
        {
          filename: `${reportType}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const singletonKey = sendOptions.idempotencyKey
      ? `report-email-delivery:${sendOptions.idempotencyKey}`
      : undefined;
    const jobId = await this.queueService.queueMail(
      options,
      singletonKey
        ? {
            singletonKey,
            singletonSeconds: getPdfEmailIdempotencySeconds(),
          }
        : {},
    );
    if (!jobId) {
      if (singletonKey) return { jobId: singletonKey };
      throw new InternalServerErrorException(
        `Mail queue rejected the report email (reportType=${reportType})`,
      );
    }
    return { jobId };
  }

  async sendPlanilla(
    to: string,
    clienteNombre: string,
    periodo: string,
    montoTotal: Decimal.Value,
    pdfBuffer: Buffer,
  ): Promise<void> {
    const attachments = await this.buildPlanillaAttachment(
      clienteNombre,
      periodo,
      pdfBuffer,
    );

    await this.sendQueued({
      version: 2,
      to,
      subject: `Planilla de Servicio de Agua - ${periodo}`,
      template: 'planilla',
      context: {
        nombre: clienteNombre,
        periodo,
        montoTotal: new Decimal(montoTotal).toFixed(2),
        fechaEmision: new Date().toLocaleDateString('es-EC'),
      },
      attachments,
    });
  }

  async sendBatchPlanillas(
    clientes: Array<{
      email: string;
      nombre: string;
      monto: Decimal.Value;
      pdf: Buffer;
    }>,
    periodo: string,
  ): Promise<void> {
    for (let index = 0; index < clientes.length; index += PLANILLA_BATCH_SIZE) {
      const chunk = clientes.slice(index, index + PLANILLA_BATCH_SIZE);
      const mails = await Promise.all(
        chunk.map(async (cliente) => {
          const attachments = await this.buildPlanillaAttachment(
            cliente.nombre,
            periodo,
            cliente.pdf,
          );
          return {
            version: 2 as const,
            to: cliente.email,
            subject: `Planilla de Servicio de Agua - ${periodo}`,
            template: 'planilla' as const,
            context: {
              nombre: cliente.nombre,
              periodo,
              montoTotal: new Decimal(cliente.monto).toFixed(2),
              fechaEmision: new Date().toLocaleDateString('es-EC'),
            },
            attachments,
          } satisfies SendMailOptions;
        }),
      );

      await this.sendBulkPlanillas(mails);
      this.logger.log(
        `Queued planilla batch ${Math.floor(index / PLANILLA_BATCH_SIZE) + 1} (${mails.length} emails)`,
      );
    }
  }

  /**
   * Tries to upload PDF to S3 first. Falls back to inline Buffer on failure.
   * Returns attachment array with url (S3) or content (inline fallback).
   */
  private async buildPlanillaAttachment(
    clienteNombre: string,
    periodo: string,
    pdfBuffer: Buffer,
  ): Promise<[MailAttachment]> {
    const periodoSlug = periodo.replace(/\s+/g, '-').toLowerCase();
    const timestamp = Date.now();
    const safeName = clienteNombre.replace(/[^a-zA-Z0-9-]/g, '_').toLowerCase();
    const key = `planillas/${periodoSlug}/${timestamp}-${safeName}.pdf`;

    if (this.storageService) {
      try {
        await this.storageService.upload(
          PLANILLA_STORAGE_BUCKET,
          key,
          pdfBuffer,
          { contentType: 'application/pdf' },
        );
        this.logger.debug(
          `Planilla PDF uploaded to s3://${PLANILLA_STORAGE_BUCKET}/${key}`,
        );
        return [
          {
            filename: `planilla-${periodoSlug}.pdf`,
            url: `s3://${PLANILLA_STORAGE_BUCKET}/${key}`,
            contentType: 'application/pdf',
          },
        ];
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `S3 upload failed for planilla, falling back to inline buffer: ${message}`,
        );
      }
    }

    return [
      {
        filename: `planilla-${periodoSlug}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  }

  async sendInvitation(
    to: string,
    nombres: string,
    token: string,
    expiresAt: Date,
  ): Promise<string> {
    const ttlHours = Math.ceil(
      (expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60),
    );

    const appUrl = process.env.APP_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://app.jasrapo.com'
        : 'http://localhost:4300');

    const jobId = await this.sendQueued({
      version: 2,
      to,
      subject: 'Completa tu registro en JASRAPO-Olon',
      template: 'invitation',
      context: {
        nombres: nombres || to.split('@')[0],
        token,
        acceptUrl: `${appUrl}/accept-invite?token=${encodeURIComponent(token)}`,
        expiresInHours: ttlHours,
      },
    });

    this.logger.log(`Invitation email queued for ${to} (jobId=${jobId})`);
    return jobId;
  }
}
