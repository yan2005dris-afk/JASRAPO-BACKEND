import { Module } from '@nestjs/common';
import { TenantsModule } from './tenants/tenants.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { CertificateModule } from './certificate.module';

@Module({
  imports: [
    TenantsModule,
    WebhooksModule,
    CertificateModule,
  ],
  exports: [
    TenantsModule,
    WebhooksModule,
    CertificateModule,
  ],
})
export class IntegrationModule {}
