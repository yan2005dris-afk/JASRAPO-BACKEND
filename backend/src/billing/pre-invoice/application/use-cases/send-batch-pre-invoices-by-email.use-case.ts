import { Injectable, Logger } from '@nestjs/common';
import type { Decimal } from 'decimal.js';
import {
  MailService,
  PLANILLA_BATCH_SIZE,
} from 'src/infrastructure/mail/mail.service';
import { GeneratePreInvoicePdfUseCase } from './generate-pre-invoice-pdf.use-case';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';

export interface SendBatchPreInvoicesByEmailResult {
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
export class SendBatchPreInvoicesByEmailUseCase {
  private readonly logger = new Logger(SendBatchPreInvoicesByEmailUseCase.name);

  constructor(
    private readonly findOne: FindOnePreInvoiceUseCase,
    private readonly generatePdf: GeneratePreInvoicePdfUseCase,
    private readonly mailService: MailService,
  ) {}

  async execute(
    prefacturaIds: number[],
  ): Promise<SendBatchPreInvoicesByEmailResult> {
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
            `Skipping pre-invoice ${prefacturaId} for email batch: ${message}`,
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
