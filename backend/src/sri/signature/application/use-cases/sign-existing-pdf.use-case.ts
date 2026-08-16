import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SignatureService, SignaturePosition } from '../signature.service';
import { CertificateService } from '../../../certificates/application/certificate.service';
import { STORAGE_PATHS } from '../../../emision/infrastructure/storage/storage-paths';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../../shared/domain/exceptions/domain.exception';

export interface SignExistingPdfInput {
  fileName: string;
  certFile: string;
  password: string;
  position?: SignaturePosition;
}

export interface SignExistingPdfResult {
  signedFileName: string;
  fileUrl: string;
  fileSize: number;
  originalFile: string;
}

@Injectable()
export class SignExistingPdfUseCase {
  private readonly publicUrl: string;

  constructor(
    private readonly signatureService: SignatureService,
    private readonly certificateService: CertificateService,
    private readonly configService: ConfigService,
  ) {
    this.publicUrl = this.configService.get<string>(
      'PUBLIC_URL',
      'http://localhost:3000',
    );
  }

  private get pdfDir(): string {
    return STORAGE_PATHS.pdfs;
  }

  async execute(input: SignExistingPdfInput): Promise<SignExistingPdfResult> {
    const { fileName, certFile, password, position } = input;

    if (!certFile || !password) {
      throw new InvalidDomainOperationException(
        'Se requiere el archivo de certificado y la contraseña',
      );
    }

    const validation = this.certificateService.validateCertificateExpiry(
      certFile,
      password,
    );

    if (!validation.isValid) {
      throw new InvalidDomainOperationException(
        `No se puede firmar: ${validation.reason}`,
      );
    }

    // Search first in 'others' folder
    let pdfPath = join(this.pdfDir, 'others', fileName);

    // If not in others, search in root for compatibility
    if (!existsSync(pdfPath)) {
      pdfPath = join(this.pdfDir, fileName);
      if (!existsSync(pdfPath)) {
        throw new EntityNotFoundException('Archivo PDF', fileName);
      }
    }

    const pdfBuffer = readFileSync(pdfPath);

    const signedPdfBuffer = await this.signatureService.signPDF(
      pdfBuffer,
      certFile,
      password,
      position || {},
    );

    const signedFileName = `signed_${fileName}`;
    const signedDir = join(this.pdfDir, 'con_firma');

    if (!existsSync(signedDir)) {
      mkdirSync(signedDir, { recursive: true });
    }

    const signedFilePath = join(signedDir, signedFileName);
    writeFileSync(signedFilePath, signedPdfBuffer);

    const fileUrl = `${this.publicUrl}/pdfs/con_firma/${signedFileName}`;

    return {
      signedFileName,
      fileUrl,
      fileSize: Buffer.byteLength(signedPdfBuffer),
      originalFile: fileName,
    };
  }
}
