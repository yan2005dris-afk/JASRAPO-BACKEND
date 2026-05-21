import { Module } from '@nestjs/common';
import { WebhooksModule } from './webhooks/webhooks.module';
import { CertificateModule } from './certificate.module';

@Module({
  imports: [WebhooksModule, CertificateModule],
  exports: [WebhooksModule, CertificateModule],
})
export class IntegrationModule {}
