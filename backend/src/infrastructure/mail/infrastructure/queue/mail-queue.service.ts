import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { Readable } from 'stream';
import { JobsService } from '../../../jobs/jobs.service';
import { MailProviderFactory } from '../providers/provider.factory';
import { StorageService } from '../../../storage/storage.service';
import type { SendMailOptions } from '../../domain/interfaces/mail-provider.interface';

export const MAIL_JOB_NAME = 'send-mail';
const S3_URL_REGEX = /^s3:\/\/([^/]+)\/(.+)$/;

/**
 * Servicio de Cola de Correos migrado a PostgreSQL (pg-boss).
 * Gestiona el encolado y procesamiento de correos sin necesidad de Redis.
 */
@Injectable()
export class MailQueueService implements OnModuleInit {
  private readonly logger = new Logger(MailQueueService.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly mailProviderFactory: MailProviderFactory,
    @Optional() private readonly storageService?: StorageService,
  ) {}

  /**
   * Registra el worker para procesar correos.
   * Llamado externamente por onModuleInit o setup lifecycle.
   */
  async onModuleInit() {
    await this.jobsService.work(MAIL_JOB_NAME, async ([job]) => {
      if (job) {
        await this.processMailJob(job);
      }
    });
    this.logger.log(
      `Worker de correo escuchando en PostgreSQL (job: ${MAIL_JOB_NAME})`,
    );
  }

  /**
   * Agrega un correo a la cola de procesamiento.
   * Ideal para envíos masivos como las 5,000 planillas.
   *
   * Returns the pg-boss jobId when accepted, or `null` if pg-boss rejected the
   * send. Existing callers that ignore the return value remain compatible —
   * the widening only adds a transparent pass-through of `JobsService.send`,
   * which already returns `string | null`.
   */
  async queueMail(options: SendMailOptions): Promise<string | null> {
    return this.jobsService.send(MAIL_JOB_NAME, options, {
      retryLimit: 3,
      retryDelay: 5, // 5 segundos iniciales
      retryDelayMax: 300, // Máximo 5 minutos
      retryBackoff: true,
    });
  }

  /**
   * Agrega múltiples correos de forma masiva (Bulk)
   */
  async queueBulkMails(mails: SendMailOptions[]) {
    const jobs = mails.map((mail) => ({
      data: mail,
      retryLimit: 3,
      retryDelay: 5,
      retryDelayMax: 300,
      retryBackoff: true,
    }));
    await this.jobsService.insert(MAIL_JOB_NAME, jobs);
  }

  /**
   * Lógica de procesamiento real del trabajo.
   * Versión-aware: detecta version:1 (legacy) vs version:2 (URLs or inline).
   */
  private async processMailJob(job: any): Promise<void> {
    const data: SendMailOptions = job.data;
    this.logger.log(
      `Procesando envío de correo para: ${Array.isArray(data.to) ? data.to.join(', ') : data.to} - Asunto: ${data.subject}`,
    );

    // Resolve attachments based on version
    const resolvedData = await this.resolveAttachments(data);

    const result = await this.mailProviderFactory.send(resolvedData);

    if (!result.success) {
      throw new Error(
        `Fallo el envío a ${Array.isArray(data.to) ? data.to.join(', ') : data.to}: ${result.error}`,
      );
    }
  }

  /**
   * Resolves attachment content based on job version.
   *
   * - version:1 | undefined → legacy: reconstruct Buffer from {type:'Buffer', data:[...]}
   * - version:2 with url → download via StorageService.getObject()
   * - version:2 with content → use directly
   */
  private async resolveAttachments(
    data: SendMailOptions,
  ): Promise<SendMailOptions> {
    if (!data.attachments || data.attachments.length === 0) {
      return data;
    }

    const version = data.version ?? 1;

    const resolvedAttachments = await Promise.all(
      data.attachments.map(async (attachment) => {
        // version:1 or undefined — legacy Buffer reconstruction
        if (version === 1) {
          let content = attachment.content as any;
          if (
            content &&
            typeof content === 'object' &&
            content.type === 'Buffer' &&
            Array.isArray(content.data)
          ) {
            content = Buffer.from(content.data);
          }
          return { ...attachment, content, url: undefined };
        }

        // version:2 — resolve url or use content directly
        if (version === 2) {
          if (attachment.url) {
            try {
              let content: Buffer;

              if (attachment.url.startsWith('http')) {
                // HTTP presigned URL — fetch directly
                this.logger.debug(`Downloading attachment from HTTP URL`);
                const response = await fetch(attachment.url);
                if (!response.ok) {
                  throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                  );
                }
                content = Buffer.from(await response.arrayBuffer());
              } else if (this.storageService) {
                // s3://bucket/key — resolve via StorageService
                const { bucket, key } = this.parseS3Url(attachment.url);
                const stream = await this.storageService.getObject(bucket, key);
                content = await this.streamToBuffer(stream);
                this.logger.debug(
                  `Resolved attachment from s3://${bucket}/${key}`,
                );
              } else {
                throw new Error(
                  'No StorageService available to resolve S3 URL',
                );
              }

              return { ...attachment, content, url: undefined };
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : 'Unknown error';
              this.logger.error(
                `Failed to download attachment from S3: ${message}`,
              );
              throw error; // Let pg-boss retry (RN02: retry once via job retry)
            }
          }

          // version:2 with content directly (inline fallback)
          if (attachment.content) {
            return { ...attachment, url: undefined };
          }
        }

        return attachment;
      }),
    );

    return { ...data, attachments: resolvedAttachments };
  }

  /**
   * Parses an S3 URL of the form s3://bucket/key
   */
  private parseS3Url(url: string): { bucket: string; key: string } {
    const match = S3_URL_REGEX.exec(url);
    if (!match) {
      throw new Error(`Invalid S3 URL format: ${url}`);
    }
    return { bucket: match[1], key: match[2] };
  }

  /**
   * Converts a Readable stream to a Buffer
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}
