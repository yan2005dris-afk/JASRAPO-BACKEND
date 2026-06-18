import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PdfService } from '../pdf.service';

@Injectable()
export class GeneratePdfUseCase {
  private readonly logger = new Logger(GeneratePdfUseCase.name);

  constructor(private readonly pdfService: PdfService) {}

  async execute(type: string, raw: Record<string, unknown>): Promise<Buffer> {
    const docType = this.pdfService.getDocumentType(type);
    if (!docType) {
      const available =
        this.pdfService.getAvailableTypes().join(', ') || 'none';
      throw new NotFoundException(
        `PDF type '${type}' not registered. Available: ${available}`,
      );
    }

    this.logger.log(`Generating PDF: type=${type}`);
    const data = docType.adaptData(raw);
    const pdf = await this.pdfService.render(docType.template, data);
    this.logger.log(`PDF ready: ${type} (${pdf.length} bytes)`);
    return pdf;
  }
}
