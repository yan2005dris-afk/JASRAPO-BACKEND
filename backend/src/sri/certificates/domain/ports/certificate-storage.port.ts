import { CertificateInfo } from '../types/certificate.types';

export abstract class CertificateStoragePort {
  abstract ensureDirectory(): void;
  abstract exists(fileName: string): boolean;
  abstract getPath(fileName: string): string;
  abstract getDir(): string;
  abstract list(options?: { page?: number; limit?: number }): {
    certificates: CertificateInfo[];
    pagination: any;
    total: number;
  };
  abstract delete(fileName: string): boolean;
  abstract readBuffer(fileName: string): Buffer;
}
