import { Injectable } from '@nestjs/common';
import { CertificateStoragePort } from '../../domain/ports/certificate-storage.port';

@Injectable()
export class DeleteCertificateUseCase {
  constructor(private readonly storage: CertificateStoragePort) {}

  execute(fileName: string): boolean {
    return this.storage.delete(fileName);
  }
}
