import { Injectable } from '@nestjs/common';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  readFileSync,
} from 'fs';
import { join, resolve, sep } from 'path';
import { CertificateStoragePort } from '../../domain/ports/certificate-storage.port';
import { CertificateInfo } from '../../domain/types/certificate.types';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../../shared/domain/exceptions/domain.exception';
import { STORAGE_PATHS } from '../../../emision/infrastructure/storage/storage-paths';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class FilesystemCertificateStorageAdapter extends CertificateStoragePort {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  private get certsDir(): string {
    return STORAGE_PATHS.certs;
  }

  ensureDirectory(): void {
    if (!existsSync(this.certsDir)) {
      mkdirSync(this.certsDir, { recursive: true });
      this.logger.log(`Directorio de certificados creado: ${this.certsDir}`);
    }
  }

  private resolveSafePath(fileName: string): string {
    const base = resolve(this.certsDir);
    const target = resolve(join(base, fileName));
    const basePrefix = base.endsWith(sep) ? base : base + sep;
    if (!target.startsWith(basePrefix) && target !== base) {
      throw new InvalidDomainOperationException(
        `Nombre de archivo inválido: contiene secuencias de path no permitidas`,
      );
    }
    return target;
  }

  exists(fileName: string): boolean {
    const filePath = this.resolveSafePath(fileName);
    return existsSync(filePath);
  }

  getPath(fileName: string): string {
    return this.resolveSafePath(fileName);
  }

  getDir(): string {
    return this.certsDir;
  }

  list(options: { page?: number; limit?: number } = {}): {
    certificates: CertificateInfo[];
    pagination: any;
    total: number;
  } {
    this.ensureDirectory();

    const allCerts = readdirSync(this.certsDir)
      .filter((file) => file.toLowerCase().endsWith('.p12'))
      .map((file) => {
        const stats = statSync(join(this.certsDir, file));
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      })
      .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());

    const total = allCerts.length;

    if (!options.page && !options.limit) {
      this.logger.log(`Se encontraron ${total} certificados`);
      return {
        certificates: allCerts,
        pagination: null,
        total,
      };
    }

    const page = Math.max(1, parseInt(String(options.page)) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(String(options.limit)) || 10),
    );
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedCerts = allCerts.slice(offset, offset + limit);

    return {
      certificates: paginatedCerts,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      total,
    };
  }

  delete(fileName: string): boolean {
    if (!fileName || !fileName.toLowerCase().endsWith('.p12')) {
      throw new InvalidDomainOperationException(
        'Nombre de archivo inválido. Debe tener extensión .p12',
      );
    }

    const filePath = this.resolveSafePath(fileName);

    if (!existsSync(filePath)) {
      throw new EntityNotFoundException('Certificado', fileName);
    }

    unlinkSync(filePath);
    this.logger.log(`Certificado eliminado: ${fileName}`);
    return true;
  }

  readBuffer(fileName: string): Buffer {
    if (!this.exists(fileName)) {
      throw new EntityNotFoundException('Certificado', fileName);
    }
    const filePath = this.resolveSafePath(fileName);
    return readFileSync(filePath);
  }
}
