import { Injectable } from '@nestjs/common';
import { CertificateStoragePort } from '../../domain/ports/certificate-storage.port';
import { CertificateInfo } from '../../domain/types/certificate.types';

@Injectable()
export class ListCertificatesUseCase {
  constructor(private readonly storage: CertificateStoragePort) {}

  execute(options: { page?: number; limit?: number } = {}): {
    certificates: CertificateInfo[];
    pagination: any;
    total: number;
  } {
    return this.storage.list(options);
  }
}
