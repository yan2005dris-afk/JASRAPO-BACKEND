import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../shared/domain/exceptions/domain.exception';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  readFileSync,
} from 'fs';
import { join, resolve, sep } from 'path';
import { parsePKCS12 } from 'node:crypto';
import { STORAGE_PATHS } from '../../emision/infrastructure/storage/storage-paths';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import {
  parseDistinguishedName,
  extractSigningCertificate,
} from '../../../shared/utils/p12-certificate.util';
import {
  CertificateInfo,
  ExtractedCertInfo,
  CertificateValidation,
} from '../domain/types/certificate.types';

export * from '../domain/types/certificate.types';

@LogContext()
@Injectable()
export class CertificateService {
  constructor(private readonly logger: LoggerService) {}

  private get certsDir(): string {
    return STORAGE_PATHS.certs;
  }

  ensureCertificateDirectory(): void {
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

  certificateExists(fileName: string): boolean {
    const filePath = this.resolveSafePath(fileName);
    return existsSync(filePath);
  }

  getCertificatePath(fileName: string): string {
    return this.resolveSafePath(fileName);
  }

  getCertsDir(): string {
    return this.certsDir;
  }

  listCertificates(options: { page?: number; limit?: number } = {}): {
    certificates: CertificateInfo[];
    pagination: any;
    total: number;
  } {
    this.ensureCertificateDirectory();

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

  deleteCertificate(fileName: string): boolean {
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

  getCertificateInfo(fileName: string): CertificateInfo & { path: string } {
    if (!this.certificateExists(fileName)) {
      throw new EntityNotFoundException('Certificado', fileName);
    }

    const filePath = join(this.certsDir, fileName);
    const stats = statSync(filePath);

    return {
      name: fileName,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      path: filePath,
    };
  }

  extractP12CertificateInfo(
    fileName: string,
    password: string,
  ): ExtractedCertInfo {
    if (!this.certificateExists(fileName)) {
      throw new EntityNotFoundException('Certificado', fileName);
    }

    const filePath = join(this.certsDir, fileName);
    const p12Buffer = readFileSync(filePath);

    return this.extractCertInfoFromBuffer(p12Buffer, password);
  }

  extractCertInfoFromBuffer(
    p12Buffer: Buffer,
    password: string,
  ): ExtractedCertInfo {
    try {
      const p12 = parsePKCS12(p12Buffer, { passphrase: password });
      const { signingCert } = extractSigningCertificate(p12);

      if (!signingCert) {
        throw new InvalidDomainOperationException(
          'No se pudo extraer el certificado del archivo P12',
        );
      }

      const subjectFields = parseDistinguishedName(signingCert.subject);
      const issuerFields = parseDistinguishedName(signingCert.issuer);
      const validFrom = new Date(signingCert.validFrom);
      const validTo = new Date(signingCert.validTo);

      return {
        subject: {
          commonName: subjectFields['CN'] || 'No disponible',
          organization: subjectFields['O'] || 'No disponible',
          country: subjectFields['C'] || 'No disponible',
        },
        issuer: {
          commonName: issuerFields['CN'] || 'No disponible',
          organization: issuerFields['O'] || 'No disponible',
        },
        validity: {
          notBefore: validFrom,
          notAfter: validTo,
        },
        serialNumber: signingCert.serialNumber,
        isExpired: new Date() > validTo,
        daysUntilExpiry: Math.ceil(
          (validTo.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        ),
      };
    } catch (err: any) {
      if (err instanceof InvalidDomainOperationException) throw err;
      throw new InvalidDomainOperationException(
        `Error al procesar el archivo P12: ${err.message || 'Contraseña incorrecta o archivo corrupto'}`,
      );
    }
  }

  validateCertificateExpiry(
    fileName: string,
    password: string,
  ): CertificateValidation {
    const certInfo = this.extractP12CertificateInfo(fileName, password);
    const now = new Date();
    const expiryDate = certInfo.validity.notAfter;
    const startDate = certInfo.validity.notBefore;

    const validation: CertificateValidation = {
      isValid: true,
      isExpired: now > expiryDate,
      isNotYetValid: now < startDate,
      expiryDate,
      startDate,
      daysUntilExpiry: Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
      subject: certInfo.subject,
      issuer: certInfo.issuer,
    };

    if (validation.isExpired) {
      validation.isValid = false;
      validation.reason = `Certificado expirado el ${expiryDate.toLocaleDateString()}`;
      this.logger.error(
        `Certificado ${fileName} EXPIRADO: ${validation.reason}`,
      );
    } else if (validation.isNotYetValid) {
      validation.isValid = false;
      validation.reason = `Certificado no válido hasta ${startDate.toLocaleDateString()}`;
      this.logger.error(
        `Certificado ${fileName} NO VÁLIDO AÚN: ${validation.reason}`,
      );
    } else if (validation.daysUntilExpiry <= 30) {
      validation.warning = `Certificado expira en ${validation.daysUntilExpiry} días`;
      this.logger.warn(
        `Certificado ${fileName} próximo a expirar: ${validation.warning}`,
      );
    }

    return validation;
  }
}
