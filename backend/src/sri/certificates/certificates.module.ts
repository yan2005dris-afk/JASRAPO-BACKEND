import { Module } from '@nestjs/common';
import { CertificateController } from './interfaces/http/certificate.controller';
import { CertificateService } from './application/certificate.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificatesModule {}
