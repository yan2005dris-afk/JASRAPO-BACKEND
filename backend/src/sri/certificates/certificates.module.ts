import { Module } from '@nestjs/common';
import { CertificateController } from './interfaces/http/certificate.controller';
import { CertificateService } from './application/certificate.service';
import { CertificateExpiryCronService } from './application/certificate-expiry-cron.service';
import { EmisoresModule } from '../emisores/emisores.module';

@Module({
  imports: [EmisoresModule],
  controllers: [CertificateController],
  providers: [CertificateService, CertificateExpiryCronService],
  exports: [CertificateService, CertificateExpiryCronService],
})
export class CertificatesModule {}

