import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { SriController } from './interfaces/http/sri.controller';
import { CatalogosController } from './interfaces/http/catalogos.controller';

// Services & Use Cases
import { SriService } from './application/services/sri.service';
import { SriIntegrationService } from './application/services/sri-integration.service';
import { SriEmisionModeService } from './application/services/sri-emision-mode.service';
import { SRIEmissionDispatcherService } from './application/services/sri-emission-dispatcher.service';
import { EmitirFacturaUseCase } from './application/use-cases/emitir-factura.use-case';
import { EmitirNotaCreditoUseCase } from './application/use-cases/emitir-nota-credito.use-case';
import { EmitirNotaDebitoUseCase } from './application/use-cases/emitir-nota-debito.use-case';
import { EmitirRetencionUseCase } from './application/use-cases/emitir-retencion.use-case';
import { EmitirComprobanteManualUseCase } from './application/use-cases/emitir-comprobante-manual.use-case';

// Infrastructure
import { ClaveAccesoService } from './infrastructure/xml/clave-acceso.service';
import { XmlBuilderService } from './infrastructure/xml/xml-builder.service';
import { XmlSignerService } from './infrastructure/xml/xml-signer.service';
import { SriSoapClient } from './infrastructure/soap/sri-soap.client';
import { SriSoapFactoryService } from './infrastructure/soap/sri-soap-factory.service';
import { SriAvailabilityService } from './infrastructure/soap/sri-availability.service';
import { XmlStorageService } from './infrastructure/storage/xml-storage.service';
import { ImageService } from './infrastructure/storage/image.service';
import { PdfImageService } from './infrastructure/storage/pdf-image.service';
import { PdfService } from './infrastructure/storage/pdf.service';
import { TemplateService } from './infrastructure/storage/template.service';
import { SriBaseService } from './infrastructure/xml/sri-base.service';
import { CatalogoValidatorService } from './infrastructure/xml/catalogo-validator.service';
import { IdentificacionValidatorService } from './infrastructure/xml/identificacion-validator.service';
import { SriEmisionProcessor } from './infrastructure/queue/processors/sri-emision.processor';

// Repositories
import { ComprobanteRepository } from './domain/repositories/comprobante.repository';
import { SecuencialRepository } from './domain/repositories/secuencial.repository';
import { PrismaComprobanteRepository } from './infrastructure/persistence/prisma-comprobante.repository';
import { PrismaSecuencialRepository } from './infrastructure/persistence/prisma-secuencial.repository';

// PDF Registrar
import { PdfService as InfraPdfService } from 'src/infrastructure/pdf/pdf.service';
import { SriDocumentPdfType } from './infrastructure/pdf/sri-document.pdf-type';
import { JobsService } from '../../infrastructure/jobs/jobs.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [SriController, CatalogosController],
  providers: [
    SriService,
    SriIntegrationService,
    SriEmisionModeService,
    SRIEmissionDispatcherService,
    EmitirFacturaUseCase,
    EmitirNotaCreditoUseCase,
    EmitirNotaDebitoUseCase,
    EmitirRetencionUseCase,
    EmitirComprobanteManualUseCase,
    ClaveAccesoService,
    XmlBuilderService,
    XmlSignerService,
    SriSoapClient,
    SriSoapFactoryService,
    SriAvailabilityService,
    XmlStorageService,
    ImageService,
    PdfImageService,
    PdfService,
    TemplateService,
    SriBaseService,
    CatalogoValidatorService,
    IdentificacionValidatorService,
    SriEmisionProcessor,
    { provide: 'JobService', useExisting: JobsService },
    {
      provide: ComprobanteRepository,
      useClass: PrismaComprobanteRepository,
    },
    {
      provide: SecuencialRepository,
      useClass: PrismaSecuencialRepository,
    },
    {
      provide: 'SRI_PDF_TYPE_REGISTRAR',
      useFactory: (pdfService: InfraPdfService) => {
        pdfService.registerDocumentType(SriDocumentPdfType);
        return true;
      },
      inject: [InfraPdfService],
    },
  ],
  exports: [
    SriService,
    SriIntegrationService,
    ComprobanteRepository,
    SriEmisionModeService,
    SRIEmissionDispatcherService,

    EmitirFacturaUseCase,
    EmitirNotaCreditoUseCase,
    EmitirNotaDebitoUseCase,
    EmitirRetencionUseCase,
    EmitirComprobanteManualUseCase,
    XmlSignerService,
    PdfService,
    TemplateService,
    SriAvailabilityService,
  ],
})
export class EmisionModule {}
