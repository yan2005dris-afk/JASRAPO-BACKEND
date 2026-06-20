import { Injectable, Logger, Optional } from '@nestjs/common';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { PdfImageService, ImageData } from './pdf-image.service';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(
    private readonly generatePdf: GeneratePdfUseCase,
    @Optional() private readonly pdfImageService?: PdfImageService,
  ) {}

  /**
   * Generate a PDF using the Puppeteer + Handlebars infrastructure
   */
  async generatePDF(
    jsonData: Record<string, unknown>,
    templatePath: string,
  ): Promise<Buffer> {
    const data = {
      ...jsonData,
      title: templatePath
        ? `Documento: ${templatePath.split('/').pop()?.split('.').shift() || 'SRI'}`
        : 'Documento SRI',
    };

    return this.generatePdf.execute('sri-document', data);
  }

  /**
   * Generate a PDF with images using post-processing
   */
  async generatePDFWithImages(
    jsonData: Record<string, unknown>,
    templatePath: string,
    images?: ImageData[],
  ): Promise<Buffer> {
    try {
      const pdfBuffer = await this.generatePDF(jsonData, templatePath);

      if (!images || images.length === 0) {
        return pdfBuffer;
      }

      if (!this.pdfImageService) {
        this.logger.warn(
          'PdfImageService not available, returning PDF without images',
        );
        return pdfBuffer;
      }

      return await this.pdfImageService.addImagesToPdf(pdfBuffer, images);
    } catch (error) {
      this.logger.error('Error al generar PDF con imágenes:', error);
      throw error;
    }
  }
}
