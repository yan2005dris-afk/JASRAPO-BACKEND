import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { SriController } from './interfaces/http/sri.controller';
import { CatalogosController } from './interfaces/http/catalogos.controller';
import { CertificateController } from './interfaces/http/certificate.controller';
import { EmisoresController } from './interfaces/http/emisores.controller';
import { SignatureController } from './interfaces/http/signature.controller';
import { WebhooksController } from './interfaces/http/webhooks.controller';

// Facade and Integration Services
import { SriService } from './application/services/sri.service';
import { SriIntegrationService } from './application/services/sri-integration.service';

// Use Cases
import { EmitirFacturaUseCase } from './application/use-cases/emitir-factura.use-case';
import { EmitirNotaCreditoUseCase } from './application/use-cases/emitir-nota-credito.use-case';
import { EmitirNotaDebitoUseCase } from './application/use-cases/emitir-nota-debito.use-case';
import { EmitirRetencionUseCase } from './application/use-cases/emitir-retencion.use-case';

// Application Services
import { CertificateService } from './application/services/certificate.service';
import { EmisoresService } from './application/services/emisores.service';
import { SignatureService } from './application/services/signature.service';
import { WebhooksService } from './application/services/webhooks.service';

// Infrastructure Providers
import { ClaveAccesoService } from './infrastructure/xml/clave-acceso.service';
import { XmlBuilderService } from './infrastructure/xml/xml-builder.service';
import { XmlSignerService } from './infrastructure/xml/xml-signer.service';
import { SriSoapClient } from './infrastructure/soap/sri-soap.client';
import { SriSoapFactoryService } from './infrastructure/soap/sri-soap-factory.service';
import { XmlStorageService } from './infrastructure/storage/xml-storage.service';
import { ImageService } from './infrastructure/storage/image.service';

// Repositories
import { ComprobanteRepository } from './domain/repositories/comprobante.repository';
import { EmisorRepository } from './domain/repositories/emisor.repository';
import { SecuencialRepository } from './domain/repositories/secuencial.repository';
import { PrismaComprobanteRepository } from './infrastructure/persistence/prisma-comprobante.repository';
import { PrismaEmisorRepository } from './infrastructure/persistence/prisma-emisor.repository';
import { PrismaSecuencialRepository } from './infrastructure/persistence/prisma-secuencial.repository';

import { PdfImageService } from './infrastructure/storage/pdf-image.service';
import { PdfService } from './infrastructure/storage/pdf.service';
import { PdfService as InfraPdfService } from 'src/infrastructure/pdf/pdf.service';
import { SriDocumentPdfType } from './infrastructure/pdf/sri-document.pdf-type';
import { TemplateService } from './infrastructure/storage/template.service';
import { SriBaseService } from './infrastructure/xml/sri-base.service';
import { CatalogoValidatorService } from './infrastructure/xml/catalogo-validator.service';
import { IdentificacionValidatorService } from './infrastructure/xml/identificacion-validator.service';

// Queue Processors
import { SriEmisionProcessor } from './infrastructure/queue/processors/sri-emision.processor';
import { WebhookProcessor } from './infrastructure/queue/processors/webhook.processor';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot(), HttpModule],
  controllers: [
    SriController,
    CatalogosController,
    CertificateController,
    EmisoresController,
    SignatureController,
    WebhooksController,
  ],
  providers: [
    SriService,
    SriIntegrationService,
    EmitirFacturaUseCase,
    EmitirNotaCreditoUseCase,
    EmitirNotaDebitoUseCase,
    EmitirRetencionUseCase,
    CertificateService,
    EmisoresService,
    SignatureService,
    WebhooksService,
    ClaveAccesoService,
    XmlBuilderService,
    XmlSignerService,
    SriSoapClient,
    SriSoapFactoryService,
    {
      provide: ComprobanteRepository,
      useClass: PrismaComprobanteRepository,
    },
    {
      provide: EmisorRepository,
      useClass: PrismaEmisorRepository,
    },
    {
      provide: SecuencialRepository,
      useClass: PrismaSecuencialRepository,
    },
    XmlStorageService,
    ImageService,
    PdfImageService,
    PdfService,
    TemplateService,
    {
      provide: 'SRI_PDF_TYPE_REGISTRAR',
      useFactory: (pdfService: InfraPdfService) => {
        pdfService.registerDocumentType(SriDocumentPdfType);
        return true;
      },
      inject: [InfraPdfService],
    },
    SriBaseService,
    CatalogoValidatorService,
    IdentificacionValidatorService,
    SriEmisionProcessor,
    WebhookProcessor,
  ],
  exports: [
    SriService,
    SriIntegrationService,
    EmitirFacturaUseCase,
    EmitirNotaCreditoUseCase,
    EmitirNotaDebitoUseCase,
    EmitirRetencionUseCase,
    CertificateService,
    EmisoresService,
    SignatureService,
    WebhooksService,
    ClaveAccesoService,
    XmlBuilderService,
    XmlSignerService,
    SriSoapClient,
    SriSoapFactoryService,
    ComprobanteRepository,
    EmisorRepository,
    SecuencialRepository,
    XmlStorageService,
    ImageService,
    PdfImageService,
    PdfService,
    TemplateService,
    SriBaseService,
    CatalogoValidatorService,
    IdentificacionValidatorService,
  ],
})
export class SriIntegrationModule {}
