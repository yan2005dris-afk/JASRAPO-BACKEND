import { Module, Global } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { GeneratePdfUseCase } from './use-cases/generate-pdf.use-case';
import { GeneratePdfToFileUseCase } from './use-cases/generate-pdf-to-file.use-case';
import { PdfHealthService } from './pdf-health.service';
import { PdfHealthController } from './pdf-health.controller';
import { PdfAttachmentCleanupService } from './pdf-attachment-cleanup.service';
import { MetricsModule } from '../observability/metrics/metrics.module';
import {
  buildPdfRuntimeOptions,
  PDF_RUNTIME_OPTIONS,
} from './pdf-runtime.config';

@Global()
@Module({
  imports: [MetricsModule],
  controllers: [PdfHealthController],
  providers: [
    {
      provide: PDF_RUNTIME_OPTIONS,
      useFactory: buildPdfRuntimeOptions,
    },
    PdfService,
    PdfHealthService,
    PdfAttachmentCleanupService,
    GeneratePdfUseCase,
    GeneratePdfToFileUseCase,
  ],
  exports: [PdfService, GeneratePdfUseCase, GeneratePdfToFileUseCase],
})
export class PdfModule {}
