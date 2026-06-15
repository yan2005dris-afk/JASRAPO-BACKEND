import { Module, Global } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { GeneratePdfUseCase } from './use-cases/generate-pdf.use-case';
import { GeneratePdfToFileUseCase } from './use-cases/generate-pdf-to-file.use-case';

@Global()
@Module({
  providers: [PdfService, GeneratePdfUseCase, GeneratePdfToFileUseCase],
  exports: [PdfService, GeneratePdfUseCase, GeneratePdfToFileUseCase],
})
export class PdfModule {}
