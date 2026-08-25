import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PdfService, type PdfRenderOptions } from '../pdf.service';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';

@Injectable()
export class GeneratePdfUseCase {
  private readonly logger = new Logger(GeneratePdfUseCase.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly institutionalProfiles: InstitutionalProfileResolver,
  ) {}

  async execute(
    type: string,
    raw: Record<string, unknown>,
    options: PdfRenderOptions = {},
  ): Promise<Buffer> {
    const docType = this.pdfService.getDocumentType(type);
    if (!docType) {
      const available =
        this.pdfService.getAvailableTypes().join(', ') || 'none';
      throw new NotFoundException(
        `PDF type '${type}' not registered. Available: ${available}`,
      );
    }

    this.logger.log(`Generating PDF: type=${type}`);
    const institutional = await this.institutionalProfiles.resolve(new Date());
    const data = {
      ...docType.adaptData(raw),
      ...institutional,
    };
    const pdf = await this.pdfService.render(docType.template, data, {
      ...options,
      documentType: options.documentType ?? type,
    });
    this.logger.log(`PDF ready: ${type} (${pdf.length} bytes)`);
    return pdf;
  }
}
