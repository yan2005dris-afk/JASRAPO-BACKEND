import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';

// Domain Modules
import { IssuanceModule } from './issuance/issuance.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { DocumentsModule } from './documents/documents.module';
import { IntegrationModule } from './integration/integration.module';
import { UtilsModule } from './utils/utils.module';
import { EmisoresModule } from './integration/emisores/emisores.module';

// Main Controller and Service
import { SriController } from './sri.controller';
import { SriService } from './sri.service';
import { CatalogosController } from './catalogos.controller';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    HttpModule,
    UtilsModule,
    EmisoresModule,
    IssuanceModule,
    AuthorizationModule,
    DocumentsModule,
    IntegrationModule,
  ],
  controllers: [SriController, CatalogosController],
  providers: [SriService],
  exports: [
    SriService,
    IssuanceModule,
    AuthorizationModule,
    DocumentsModule,
    IntegrationModule,
    UtilsModule,
    EmisoresModule,
  ],
})
export class SriIntegrationModule {}
