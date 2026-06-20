import { BadRequestException, Injectable } from '@nestjs/common';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { GeneratePreInvoicePdfUseCase } from './generate-pre-invoice-pdf.use-case';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';

type PreInvoiceWithRelations = Awaited<
  ReturnType<FindOnePreInvoiceUseCase['execute']>
>;

@Injectable()
export class SendPreInvoiceByEmailUseCase {
  constructor(
    private readonly findOne: FindOnePreInvoiceUseCase,
    private readonly generatePdf: GeneratePreInvoicePdfUseCase,
    private readonly mailService: MailService,
  ) {}

  async execute(
    prefacturaId: number,
  ): Promise<{ email: string; queued: true }> {
    const preInvoice = await this.findOne.execute(prefacturaId);
    const email = this.resolveClientEmail(preInvoice);
    const clienteNombre = this.resolveClientName(preInvoice);
    const periodo = preInvoice.periodoRel?.nombre ?? 'N/A';

    const pdfBuffer = await this.generatePdf.execute(prefacturaId);

    await this.mailService.sendPlanilla(
      email,
      clienteNombre,
      periodo,
      preInvoice.totalPagar,
      pdfBuffer,
    );

    return { email, queued: true };
  }

  private resolveClientEmail(preInvoice: PreInvoiceWithRelations): string {
    const email =
      preInvoice.clienteEmail ?? preInvoice.contrato?.cliente?.email;

    if (!email) {
      throw new BadRequestException(
        `Pre-invoice ${preInvoice.prefacturaId} has no client email`,
      );
    }

    return email;
  }

  private resolveClientName(preInvoice: PreInvoiceWithRelations): string {
    if (preInvoice.clienteNombre) {
      return preInvoice.clienteNombre;
    }

    const cliente = preInvoice.contrato?.cliente;
    if (!cliente) {
      return 'Cliente';
    }

    const fullName =
      `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim();
    return fullName || 'Cliente';
  }
}
