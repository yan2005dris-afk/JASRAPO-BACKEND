import { Module, Global } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { GeneratePdfUseCase } from './use-cases/generate-pdf.use-case';
import { GeneratePdfToFileUseCase } from './use-cases/generate-pdf-to-file.use-case';
import { PdfHealthService } from './pdf-health.service';
import { PdfHealthController } from './pdf-health.controller';
import { PdfAttachmentCleanupService } from './pdf-attachment-cleanup.service';

@Global()
@Module({
  controllers: [PdfHealthController],
  providers: [
    PdfService,
    PdfHealthService,
    PdfAttachmentCleanupService,
    GeneratePdfUseCase,
    GeneratePdfToFileUseCase,
  ],
  exports: [PdfService, GeneratePdfUseCase, GeneratePdfToFileUseCase],
})
export class PdfModule {}
