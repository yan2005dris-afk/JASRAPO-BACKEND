import {
  Controller,
  Post,
  Param,
  Body,
  Res,
  BadRequestException,
  NotFoundException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { SignatureService } from '../../application/signature.service';
import { CertificateService } from '../../../certificates/application/certificate.service';
import { GenerateAndSignPdfUseCase } from '../../application/use-cases/generate-and-sign-pdf.use-case';
import { SignPdfDto, GenerateAndSignPdfDto } from '../dto/signature.dto';
import { STORAGE_PATHS } from '../../../emision/infrastructure/storage/storage-paths';

@ApiTags('[En Desarrollo] Signature')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('signature')
export class SignatureController {
  private readonly logger = new Logger(SignatureController.name);
  private readonly publicUrl: string;

  constructor(
    private readonly signatureService: SignatureService,
    private readonly certificateService: CertificateService,
    private readonly generateAndSignPdfUseCase: GenerateAndSignPdfUseCase,
    private readonly configService: ConfigService,
  ) {
    this.publicUrl = this.configService.get<string>(
      'PUBLIC_URL',
      'http://localhost:3000',
    );
  }

  /**
   * Get PDF directory from STORAGE_PATHS
   */
  private get pdfDir(): string {
    return STORAGE_PATHS.pdfs;
  }

  /**
   * POST /signature/sign-pdf/:fileName
   * Sign an existing PDF
   */
  @Post('sign-pdf/:fileName')
  @ApiOperation({ summary: 'Firmar un PDF existente' })
  @ApiParam({
    name: 'fileName',
    description: 'Nombre del archivo PDF a firmar',
  })
  @SwaggerResponse({ status: 200, description: 'PDF firmado correctamente' })
  async signExistingPdf(
    @Param('fileName') fileName: string,
    @Body() body: SignPdfDto,
  ) {
    const { certFile, password, position } = body;

    if (!certFile || !password) {
      throw new BadRequestException(
        'Se requiere el archivo de certificado y la contraseña',
      );
    }

    // Validate certificate exists and is not expired
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

      // Log warning if certificate expires soon
      if (validation.warning) {
        this.logger.warn(`ADVERTENCIA: ${validation.warning}`);
      }
    } catch (certError) {
      if (certError instanceof BadRequestException) {
        throw certError;
      }
      throw new BadRequestException(
        `Error al validar el certificado: ${(certError as Error).message}. Verifique que el archivo existe y la contraseña es correcta.`,
      );
    }

    // Search first in 'others' folder
    let pdfPath = join(this.pdfDir, 'others', fileName);

    // If not in others, search in root for compatibility
    if (!existsSync(pdfPath)) {
      pdfPath = join(this.pdfDir, fileName);
      if (!existsSync(pdfPath)) {
        throw new NotFoundException('Archivo PDF no encontrado');
      }
    }

    // Read PDF
    const pdfBuffer = readFileSync(pdfPath);

    // Sign PDF with optional position
    const signedPdfBuffer = await this.signatureService.signPDF(
      pdfBuffer,
      certFile,
      password,
      position || {},
    );

    // Save signed PDF
    const signedFileName = `signed_${fileName}`;
    const signedDir = join(this.pdfDir, 'con_firma');

    if (!existsSync(signedDir)) {
      mkdirSync(signedDir, { recursive: true });
    }

    const signedFilePath = join(signedDir, signedFileName);
    writeFileSync(signedFilePath, signedPdfBuffer);

    // Build file URL
    const fileUrl = `${this.publicUrl}/pdfs/con_firma/${signedFileName}`;

    return {
      success: true,
      data: {
        message: 'PDF firmado correctamente',
        fileName: signedFileName,
        fileUrl: fileUrl,
        fileSize: Buffer.byteLength(signedPdfBuffer),
        originalFile: fileName,
      },
    };
  }

  /**
   * POST /signature/generate-sign-pdf/:templateId
   * Generate and sign PDF in one step
   */
  @Post('generate-sign-pdf/:templateId')
  @ApiOperation({ summary: 'Generar y firmar PDF en un solo paso' })
  @ApiParam({
    name: 'templateId',
    required: false,
    description: 'ID del template',
  })
  @SwaggerResponse({ status: 200, description: 'PDF generado y firmado' })
  async generateAndSignPdf(
    @Param('templateId') templateId: string,
    @Body() body: GenerateAndSignPdfDto,
  ) {
    const { jsonData, certFile, password, position } = body;

    if (!jsonData) {
      throw new BadRequestException(
        'No se proporcionaron datos JSON para la generación del documento',
      );
    }

    if (!certFile || !password) {
      throw new BadRequestException(
        'Se requiere el archivo de certificado y la contraseña para la firma',
      );
    }

    const result = await this.generateAndSignPdfUseCase.execute({
      templateId,
      jsonData,
      certFile,
      password,
      position,
    });

    return {
      success: true,
      data: {
        message: 'PDF generado y firmado correctamente',
        signedFile: {
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
        },
        templateUsed: result.templateUsed,
      },
    };
  }

  /**
   * POST /signature/generate-sign-pdf/download/:templateId
   * Generate and sign PDF with direct download
   */
  @Post('generate-sign-pdf/download/:templateId')
  @ApiOperation({ summary: 'Generar y firmar PDF con descarga directa' })
  @ApiParam({
    name: 'templateId',
    required: false,
    description: 'ID del template',
  })
  @SwaggerResponse({ status: 200, description: 'PDF firmado descargado' })
  async generateAndSignPdfDownload(
    @Param('templateId') templateId: string,
    @Body() body: GenerateAndSignPdfDto,
    @Res() res: Response,
  ) {
    const { jsonData, certFile, password, position } = body;

    if (!jsonData) {
      throw new BadRequestException(
        'No se proporcionaron datos JSON para la generación del documento',
      );
    }

    if (!certFile || !password) {
      throw new BadRequestException(
        'Se requiere el archivo de certificado y la contraseña para la firma',
      );
    }

    const result = await this.generateAndSignPdfUseCase.execute({
      templateId,
      jsonData,
      certFile,
      password,
      position,
    });

    // Set headers and send as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=documento_firmado.pdf',
    );
    return res.send(result.signedPdfBuffer);
  }
}
