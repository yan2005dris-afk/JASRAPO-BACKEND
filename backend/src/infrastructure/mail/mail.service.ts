import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { MailProviderFactory } from './providers/provider.factory';
import { MailQueueService } from './mail-queue.service';
import type {
  MailResult,
  SendMailOptions,
} from './interfaces/mail-provider.interface';

export const PLANILLA_BATCH_SIZE = 25;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly providerFactory: MailProviderFactory,
    private readonly queueService: MailQueueService,
  ) {}

  async send(options: SendMailOptions): Promise<MailResult> {
    return this.providerFactory.send(options);
  }

  async sendQueued(options: SendMailOptions): Promise<void> {
    await this.queueService.queueMail(options);
  }

  async sendBulkPlanillas(mails: SendMailOptions[]): Promise<void> {
    await this.queueService.queueBulkMails(mails);
  }

  async sendPlanilla(
    to: string,
    clienteNombre: string,
    periodo: string,
    montoTotal: Decimal.Value,
    pdfBuffer: Buffer,
  ): Promise<void> {
    await this.sendQueued(
      this.buildPlanillaMailOptions(
        to,
        clienteNombre,
        periodo,
        montoTotal,
        pdfBuffer,
      ),
    );
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
      const mails = chunk.map((cliente) =>
        this.buildPlanillaMailOptions(
          cliente.email,
          cliente.nombre,
          periodo,
          cliente.monto,
          cliente.pdf,
        ),
      );

      await this.sendBulkPlanillas(mails);
      this.logger.log(
        `Queued planilla batch ${Math.floor(index / PLANILLA_BATCH_SIZE) + 1} (${mails.length} emails)`,
      );
    }
  }

  private buildPlanillaMailOptions(
    to: string,
    clienteNombre: string,
    periodo: string,
    montoTotal: Decimal.Value,
    pdfBuffer: Buffer,
  ): SendMailOptions {
    const periodoSlug = periodo.replace(/\s+/g, '-').toLowerCase();

    return {
      to,
      subject: `Planilla de Servicio de Agua - ${periodo}`,
      template: 'planilla',
      context: {
        nombre: clienteNombre,
        periodo,
        montoTotal: new Decimal(montoTotal).toFixed(2),
        fechaEmision: new Date().toLocaleDateString('es-EC'),
      },
      attachments: [
        {
          filename: `planilla-${periodoSlug}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };
  }
}
