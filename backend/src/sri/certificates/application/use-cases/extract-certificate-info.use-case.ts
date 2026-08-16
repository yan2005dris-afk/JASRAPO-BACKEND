import { Injectable } from '@nestjs/common';
import { CertificateStoragePort } from '../../domain/ports/certificate-storage.port';
import { CertificateParserPort } from '../../domain/ports/certificate-parser.port';
import { ExtractedCertInfo } from '../../domain/types/certificate.types';

@Injectable()
export class ExtractCertificateInfoUseCase {
  constructor(
    private readonly storage: CertificateStoragePort,
    private readonly parser: CertificateParserPort,
  ) {}

  execute(fileName: string, password: string): ExtractedCertInfo {
    const buffer = this.storage.readBuffer(fileName);
    return this.parser.extractCertInfoFromBuffer(buffer, password);
  }
}
