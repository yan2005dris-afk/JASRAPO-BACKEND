import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Sub-modules
import { EmisionModule } from './emision/emision.module';
import { EmisoresModule } from './emisores/emisores.module';
import { CertificatesModule } from './certificates/certificates.module';
import { SignatureModule } from './signature/signature.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    EmisionModule,
    EmisoresModule,
    CertificatesModule,
    SignatureModule,
    WebhooksModule,
  ],
  exports: [
    EmisionModule,
    EmisoresModule,
    CertificatesModule,
    SignatureModule,
    WebhooksModule,
  ],
})
export class SriIntegrationModule {}
