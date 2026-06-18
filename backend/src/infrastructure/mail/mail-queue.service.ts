import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { MailProviderFactory } from './providers/provider.factory';
import { SendMailOptions } from './interfaces/mail-provider.interface';

export const MAIL_JOB_NAME = 'send-mail';

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
  ) {}

  /**
   * Inicializa el worker para procesar correos al arrancar el módulo.
   */
  async onModuleInit() {
    await this.jobsService.work(MAIL_JOB_NAME, async (job) => {
      await this.processMailJob(job);
    });
    this.logger.log(
      `Worker de correo escuchando en PostgreSQL (job: ${MAIL_JOB_NAME})`,
    );
  }

  /**
   * Agrega un correo a la cola de procesamiento.
   * Ideal para envíos masivos como las 5,000 planillas.
   */
  async queueMail(options: SendMailOptions) {
    await this.jobsService.send(MAIL_JOB_NAME, options, {
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
   */
  private async processMailJob(job: any): Promise<void> {
    const data: SendMailOptions = job.data;
    this.logger.log(
      `Procesando envío de correo para: ${Array.isArray(data.to) ? data.to.join(', ') : data.to} - Asunto: ${data.subject}`,
    );

    const result = await this.mailProviderFactory.send(data);

    if (!result.success) {
      throw new Error(
        `Fallo el envío a ${Array.isArray(data.to) ? data.to.join(', ') : data.to}: ${result.error}`,
      );
    }
  }
}
