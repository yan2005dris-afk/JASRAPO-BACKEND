import {
  Controller,
  Post,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { GenerateAndSignPdfUseCase } from '../../application/use-cases/generate-and-sign-pdf.use-case';
import { SignExistingPdfUseCase } from '../../application/use-cases/sign-existing-pdf.use-case';
import { SignPdfDto, GenerateAndSignPdfDto } from '../dto/signature.dto';
import { InvalidDomainOperationException } from '../../../../shared/domain/exceptions/domain.exception';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@ApiTags('[En Desarrollo] Signature')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('signature')
export class SignatureController {
  constructor(
    private readonly signExistingPdfUseCase: SignExistingPdfUseCase,
    private readonly generateAndSignPdfUseCase: GenerateAndSignPdfUseCase,
    private readonly logger: LoggerService,
  ) {}

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

    const result = await this.signExistingPdfUseCase.execute({
      fileName,
      certFile,
      password,
      position,
    });

    return {
      success: true,
      data: {
        message: 'PDF firmado correctamente',
        fileName: result.signedFileName,
        fileUrl: result.fileUrl,
        fileSize: result.fileSize,
        originalFile: result.originalFile,
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
      throw new InvalidDomainOperationException(
        'No se proporcionaron datos JSON para la generación del documento',
      );
    }

    if (!certFile || !password) {
      throw new InvalidDomainOperationException(
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
      throw new InvalidDomainOperationException(
        'No se proporcionaron datos JSON para la generación del documento',
      );
    }

    if (!certFile || !password) {
      throw new InvalidDomainOperationException(
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=documento_firmado.pdf',
    );
    return res.send(result.signedPdfBuffer);
  }
}
