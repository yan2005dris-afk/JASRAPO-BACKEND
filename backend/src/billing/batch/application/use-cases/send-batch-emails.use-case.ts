import { Injectable, Logger } from '@nestjs/common';
import type { Decimal } from 'decimal.js';
import {
  MailService,
  PLANILLA_BATCH_SIZE,
} from 'src/infrastructure/mail/application/mail.service';
import { GeneratePreInvoicePdfUseCase } from '../../../pre-invoice/application/use-cases/generate-pre-invoice-pdf.use-case';
import { FindOnePreInvoiceUseCase } from '../../../pre-invoice/application/use-cases/find-one-pre-invoice.use-case';
import { PreInvoiceRepository } from '../../../pre-invoice/domain/repositories/pre-invoice.repository';

export interface SendBatchEmailsResult {
  queued: number;
  skipped: number;
  batches: number;
}

type PlanillaCliente = {
  email: string;
  nombre: string;
  monto: Decimal.Value;
  pdf: Buffer;
  periodo: string;
};

@Injectable()
export class SendBatchEmailsUseCase {
  private readonly logger = new Logger(SendBatchEmailsUseCase.name);

  constructor(
    private readonly findOne: FindOnePreInvoiceUseCase,
    private readonly generatePdf: GeneratePreInvoicePdfUseCase,
    private readonly mailService: MailService,
    private readonly preInvoiceRepository: PreInvoiceRepository,
  ) {}

  async execute(batchId: number): Promise<SendBatchEmailsResult> {
    const prefacturaIds = await this.resolveBatchToIds(batchId);

    if (prefacturaIds.length === 0) {
      this.logger.warn(
        `No se encontraron pre-facturas para el lote ${batchId}`,
      );
      return { queued: 0, skipped: 0, batches: 0 };
    }

    return this.processEmails(prefacturaIds);
  }

  /**
   * Finds all pre-invoice IDs for a given batch/lot
   */
  private async resolveBatchToIds(batchId: number): Promise<number[]> {
    const prefacturas = await this.preInvoiceRepository.findIdsByLoteId(
      BigInt(batchId),
    );
    return prefacturas.map((p) => Number(p.prefacturaId));
  }

  /**
   * Core logic: process a list of pre-invoice IDs and send emails
   */
  private async processEmails(
    prefacturaIds: number[],
  ): Promise<SendBatchEmailsResult> {
    let queued = 0;
    let skipped = 0;
    let batches = 0;

    for (
      let index = 0;
      index < prefacturaIds.length;
      index += PLANILLA_BATCH_SIZE
    ) {
      const chunk = prefacturaIds.slice(index, index + PLANILLA_BATCH_SIZE);
      const clientes: PlanillaCliente[] = [];

      for (const prefacturaId of chunk) {
        try {
          const preInvoice = await this.findOne.execute(prefacturaId);
          const email =
            preInvoice.clienteEmail ?? preInvoice.contrato?.cliente?.email;

          if (!email) {
            skipped += 1;
            continue;
          }

          const pdf = await this.generatePdf.execute(prefacturaId);
          const nombre =
            preInvoice.clienteNombre ??
            `${preInvoice.contrato?.cliente?.nombres ?? ''} ${preInvoice.contrato?.cliente?.apellidos ?? ''}`.trim();
          const periodo = preInvoice.periodoRel?.nombre ?? 'N/A';

          clientes.push({
            email,
            nombre: nombre || 'Cliente',
            monto: preInvoice.totalPagar,
            pdf,
            periodo,
          });
        } catch (error: unknown) {
          skipped += 1;
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(
            `Saltando pre-factura ${prefacturaId} para envio de emails: ${message}`,
          );
        }
      }

      if (clientes.length === 0) {
        continue;
      }

      const clientesByPeriodo = new Map<
        string,
        Array<Omit<PlanillaCliente, 'periodo'>>
      >();

      for (const { periodo, ...mailData } of clientes) {
        const group = clientesByPeriodo.get(periodo) ?? [];
        group.push(mailData);
        clientesByPeriodo.set(periodo, group);
      }

      for (const [periodo, periodoClientes] of clientesByPeriodo) {
        await this.mailService.sendBatchPlanillas(periodoClientes, periodo);
        queued += periodoClientes.length;
        batches += 1;
      }
    }

    return { queued, skipped, batches };
  }
}
