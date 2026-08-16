import { Injectable } from '@nestjs/common';
import { ExtractCertificateInfoUseCase } from './extract-certificate-info.use-case';
import { CertificateParserPort } from '../../domain/ports/certificate-parser.port';
import { CertificateValidation } from '../../domain/types/certificate.types';

@Injectable()
export class ValidateCertificateUseCase {
  constructor(
    private readonly extractInfoUseCase: ExtractCertificateInfoUseCase,
    private readonly parser: CertificateParserPort,
  ) {}

  execute(fileName: string, password: string): CertificateValidation {
    const certInfo = this.extractInfoUseCase.execute(fileName, password);
    return this.parser.validateCertificateExpiry(certInfo);
  }
}
