import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { SignatureService, SignaturePosition } from '../signature.service';
import { CertificateService } from '../../../certificates/application/certificate.service';
import { PdfService } from '../../../emision/infrastructure/storage/pdf.service';
import { TemplateService } from '../../../emision/infrastructure/storage/template.service';
import { STORAGE_PATHS } from '../../../emision/infrastructure/storage/storage-paths';

export interface GenerateAndSignPdfInput {
  templateId: string;
  jsonData: Record<string, unknown>;
  certFile: string;
  password: string;
  position?: SignaturePosition;
}

export interface GenerateAndSignPdfResult {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  templateUsed: string;
  signedPdfBuffer: Buffer;
}

@Injectable()
export class GenerateAndSignPdfUseCase {
  private readonly publicUrl: string;

  constructor(
    private readonly signatureService: SignatureService,
    private readonly certificateService: CertificateService,
    private readonly pdfService: PdfService,
    private readonly templateService: TemplateService,
    private readonly configService: ConfigService,
  ) {
    this.publicUrl = this.configService.get<string>(
      'PUBLIC_URL',
      'http://localhost:3000',
    );
  }

  async execute(
    input: GenerateAndSignPdfInput,
  ): Promise<GenerateAndSignPdfResult> {
    const { templateId, jsonData, certFile, password, position } = input;

    // Validate certificate
    try {
      const validation = this.certificateService.validateCertificateExpiry(
        certFile,
        password,
      );

      if (!validation.isValid) {
        throw new BadRequestException({
          message: `No se puede firmar: ${validation.reason}`,
          validationDetails: {
            isExpired: validation.isExpired,
            isNotYetValid: validation.isNotYetValid,
            expiryDate: validation.expiryDate,
            startDate: validation.startDate,
            subject: validation.subject,
          },
        });
      }
    } catch (certError) {
      if (certError instanceof BadRequestException) {
        throw certError;
      }
      throw new BadRequestException(
        `Error al validar el certificado: ${(certError as Error).message}. Verifique que el archivo existe y la contraseña es correcta.`,
      );
    }

    // Step 1: Generate PDF
    const templatePath = this.templateService.findTemplate(templateId);
    const pdfBuffer = await this.pdfService.generatePDF(jsonData, templatePath);

    // Step 2: Sign PDF
    const signedPdfBuffer = await this.signatureService.signPDF(
      pdfBuffer,
      certFile,
      password,
      position || {},
    );

    // Generate unique filename
    const now = new Date();
    const fileName = `documento_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.pdf`;
    const signedFileName = `signed_${fileName}`;

    // Ensure signed directory exists
    const signedDir = join(STORAGE_PATHS.pdfs, 'con_firma');
    if (!existsSync(signedDir)) {
      mkdirSync(signedDir, { recursive: true });
    }

    // Save signed PDF
    const signedFilePath = join(signedDir, signedFileName);
    writeFileSync(signedFilePath, signedPdfBuffer);

    // Build file URL
    const signedFileUrl = `${this.publicUrl}/pdfs/con_firma/${signedFileName}`;

    return {
      fileName: signedFileName,
      fileUrl: signedFileUrl,
      fileSize: Buffer.byteLength(signedPdfBuffer),
      templateUsed: basename(templatePath),
      signedPdfBuffer,
    };
  }
}
