import { Injectable } from '@nestjs/common';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { FindOnePreInvoiceUseCase } from './find-one-pre-invoice.use-case';

@Injectable()
export class GeneratePreInvoicePdfUseCase {
  constructor(
    private readonly findOne: FindOnePreInvoiceUseCase,
    private readonly generatePdf: GeneratePdfUseCase,
  ) {}

  async execute(id: number): Promise<Buffer> {
    const data = await this.findOne.execute(id);
    return this.generatePdf.execute('pre-invoice', data as unknown as Record<string, unknown>);
  }
}
