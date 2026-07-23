import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { EmisoresService } from '../../application/emisores.service';
import {
  CreateEmisorDto,
  UpdateEmisorDto,
  EmisorResponseDto,
  UploadCertificadoDto,
} from '../dto';
import { JwtAuthGuard } from '../../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';

const P12_MIME_TYPE = 'application/x-pkcs12';

/**
 * Factory for FileInterceptor fileFilter — restricts uploads to P12
 * certificate files, accepting either the `.p12` extension or the
 * `application/x-pkcs12` mimetype (browsers often send a generic
 * `application/octet-stream` mimetype for this file type).
 */
export function createP12FileFilter() {
  return (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    const hasP12Extension = file.originalname?.toLowerCase().endsWith('.p12');
    const hasP12Mimetype = file.mimetype === P12_MIME_TYPE;

    if (!hasP12Extension && !hasP12Mimetype) {
      return callback(
        new BadRequestException(
          'Solo se permiten archivos de certificado P12 (.p12)',
        ),
        false,
      );
    }
    callback(null, true);
  };
}

/**
 * Multer options for the certificate upload route. Exported (rather than
 * inlined in the decorator) so the size limit and file filter wiring can be
 * asserted directly in unit tests without spinning up the HTTP layer.
 */
export const P12_UPLOAD_OPTIONS = {
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: createP12FileFilter(),
};

@LogContext()
@ApiTags('[En Desarrollo] Emisores')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('emisores')
export class EmisoresController {
  constructor(
    private readonly emisoresService: EmisoresService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los emisores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de emisores',
    type: [EmisorResponseDto],
  })
  @RequiredPermission('emisores', 'read')
  async findAll(): Promise<EmisorResponseDto[]> {
    return this.emisoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un emisor por ID' })
  @ApiResponse({
    status: 200,
    description: 'Emisor encontrado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'read')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo emisor' })
  @ApiResponse({
    status: 201,
    description: 'Emisor creado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'RUC ya existe' })
  @RequiredPermission('emisores', 'create')
  async create(@Body() dto: CreateEmisorDto): Promise<EmisorResponseDto> {
    return this.emisoresService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un emisor' })
  @ApiResponse({
    status: 200,
    description: 'Emisor actualizado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmisorDto,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inactivar un emisor (eliminación lógica)' })
  @ApiResponse({
    status: 200,
    description: 'Emisor inactivado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Emisor ya está inactivo' })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'delete')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.delete(id);
  }

  @Post(':id/certificado')
  @ApiOperation({
    summary: 'Cargar certificado digital P12 del emisor',
    description:
      'Sube y valida un certificado P12, cifra su contraseña y actualiza la metadata del emisor.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadCertificadoDto })
  @ApiResponse({
    status: 200,
    description: 'Certificado cargado y emisor actualizado',
    type: EmisorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o certificado no procesable',
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'update')
  @UseInterceptors(FileInterceptor('file', P12_UPLOAD_OPTIONS))
  async uploadCertificado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UploadCertificadoDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<EmisorResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'No se ha adjuntado ningún archivo de certificado (.p12)',
      );
    }
    return this.emisoresService.uploadCertificado(
      id,
      file.buffer,
      dto.password,
    );
  }

  @Delete(':id/certificado')
  @ApiOperation({ summary: 'Eliminar el certificado digital del emisor' })
  @ApiResponse({
    status: 200,
    description: 'Certificado eliminado y emisor actualizado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'delete')
  async deleteCertificado(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.deleteCertificado(id);
  }
}
