import { Module } from '@nestjs/common';
import {
  PdfService,
  PdfImageService,
  ImageService,
  TemplateService,
  XmlStorageService,
} from './services';

@Module({
  providers: [
    PdfService,
    PdfImageService,
    ImageService,
    TemplateService,
    XmlStorageService,
  ],
  exports: [
    PdfService,
    PdfImageService,
    ImageService,
    TemplateService,
    XmlStorageService,
  ],
})
export class DocumentsModule {}
