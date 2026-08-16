import { Module } from '@nestjs/common';
import { CertificateController } from './interfaces/http/certificate.controller';
import { CertificateService } from './application/certificate.service';
import { CertificateStoragePort } from './domain/ports/certificate-storage.port';
import { FilesystemCertificateStorageAdapter } from './infrastructure/adapters/filesystem-certificate-storage.adapter';
import { CertificateParserPort } from './domain/ports/certificate-parser.port';
import { ForgeCertificateParserAdapter } from './infrastructure/adapters/forge-certificate-parser.adapter';
import { ListCertificatesUseCase } from './application/use-cases/list-certificates.use-case';
import { DeleteCertificateUseCase } from './application/use-cases/delete-certificate.use-case';
import { ExtractCertificateInfoUseCase } from './application/use-cases/extract-certificate-info.use-case';
import { ValidateCertificateUseCase } from './application/use-cases/validate-certificate.use-case';

@Module({
  controllers: [CertificateController],
  providers: [
    {
      provide: CertificateStoragePort,
      useClass: FilesystemCertificateStorageAdapter,
    },
    {
      provide: CertificateParserPort,
      useClass: ForgeCertificateParserAdapter,
    },
    ListCertificatesUseCase,
    DeleteCertificateUseCase,
    ExtractCertificateInfoUseCase,
    ValidateCertificateUseCase,
    CertificateService,
  ],
  exports: [
    CertificateStoragePort,
    CertificateParserPort,
    ListCertificatesUseCase,
    DeleteCertificateUseCase,
    ExtractCertificateInfoUseCase,
    ValidateCertificateUseCase,
    CertificateService,
  ],
})
export class CertificatesModule {}
