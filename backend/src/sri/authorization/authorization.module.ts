import { Module, forwardRef } from '@nestjs/common';
import {
  SriSoapClient,
  SriSoapFactoryService,
  XmlSignerService,
  XmlBuilderService,
  ClaveAccesoService,
  IdentificacionValidatorService,
} from './services';
import { SriEmisionProcessor } from './processors/sri-emision.processor';
import { SignatureService } from './signature.service';
import { SignatureController } from './signature.controller';
import { DocumentsModule } from '../documents/documents.module';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [
    forwardRef(() => DocumentsModule),
    forwardRef(() => IntegrationModule),
  ],
  controllers: [SignatureController],
  providers: [
    SriSoapClient,
    SriSoapFactoryService,
    XmlSignerService,
    XmlBuilderService,
    ClaveAccesoService,
    IdentificacionValidatorService,
    SriEmisionProcessor,
    SignatureService,
  ],
  exports: [
    SriSoapClient,
    SriSoapFactoryService,
    XmlSignerService,
    XmlBuilderService,
    ClaveAccesoService,
    IdentificacionValidatorService,
    SignatureService,
  ],
})
export class AuthorizationModule {}
