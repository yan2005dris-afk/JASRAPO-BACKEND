import { Injectable } from '@nestjs/common';
import { CertificateStoragePort } from '../domain/ports/certificate-storage.port';
import { CertificateParserPort } from '../domain/ports/certificate-parser.port';
import { ListCertificatesUseCase } from './use-cases/list-certificates.use-case';
import { DeleteCertificateUseCase } from './use-cases/delete-certificate.use-case';
import { ExtractCertificateInfoUseCase } from './use-cases/extract-certificate-info.use-case';
import { ValidateCertificateUseCase } from './use-cases/validate-certificate.use-case';
import {
  CertificateInfo,
  ExtractedCertInfo,
  CertificateValidation,
} from '../domain/types/certificate.types';

export * from '../domain/types/certificate.types';

@Injectable()
export class CertificateService {
  constructor(
    private readonly storage: CertificateStoragePort,
    private readonly parser: CertificateParserPort,
    private readonly listCertificatesUseCase: ListCertificatesUseCase,
    private readonly deleteCertificateUseCase: DeleteCertificateUseCase,
    private readonly extractCertificateInfoUseCase: ExtractCertificateInfoUseCase,
    private readonly validateCertificateUseCase: ValidateCertificateUseCase,
  ) {}

  ensureCertificateDirectory(): void {
    this.storage.ensureDirectory();
  }

  certificateExists(fileName: string): boolean {
    return this.storage.exists(fileName);
  }

  getCertificatePath(fileName: string): string {
    return this.storage.getPath(fileName);
  }

  getCertsDir(): string {
    return this.storage.getDir();
  }

  listCertificates(options: { page?: number; limit?: number } = {}): {
    certificates: CertificateInfo[];
    pagination: any;
    total: number;
  } {
    return this.listCertificatesUseCase.execute(options);
  }

  deleteCertificate(fileName: string): boolean {
    return this.deleteCertificateUseCase.execute(fileName);
  }

  getCertificateInfo(fileName: string): CertificateInfo & { path: string } {
    const stats = this.storage.getPath(fileName);
    const info = this.storage.list().certificates.find((c) => c.name === fileName);
    if (!info) {
      throw new Error(`Certificado ${fileName} no encontrado`);
    }
    return { ...info, path: stats };
  }

  extractP12CertificateInfo(
    fileName: string,
    password: string,
  ): ExtractedCertInfo {
    return this.extractCertificateInfoUseCase.execute(fileName, password);
  }

  extractCertInfoFromBuffer(
    p12Buffer: Buffer,
    password: string,
  ): ExtractedCertInfo {
    return this.parser.extractCertInfoFromBuffer(p12Buffer, password);
  }

  validateCertificateExpiry(
    fileName: string,
    password: string,
  ): CertificateValidation {
    return this.validateCertificateUseCase.execute(fileName, password);
  }
}
