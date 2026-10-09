import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';
import { EmisoresService } from '../../application/emisores.service';
import {
  CreateEmisorDto,
  UpdateEmisorDto,
  EmisorResponseDto,
  UploadCertificadoDto,
} from '../dto/emisor.dto';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

const CERTIFICATE_MIME_TYPES = new Set([
  'application/pkcs12',
  'application/x-pkcs12',
  'application/x-pkcs',
  'application/octet-stream',
]);

export const EMISOR_CERTIFICATE_UPLOAD_OPTIONS: MulterOptions = {
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_request, file, callback) => {
    const hasCertificateExtension = /\.(p12|pfx)$/i.test(file.originalname);
    const hasCertificateMimeType = CERTIFICATE_MIME_TYPES.has(
      file.mimetype.toLowerCase(),
    );

    if (!hasCertificateExtension || !hasCertificateMimeType) {
      return callback(
        new BadRequestException('Solo se permiten certificados .p12 o .pfx'),
        false,
      );
    }

    callback(null, true);
  },
};

@LogContext()
@ApiTags('[SRI] Emisores')
@ApiBearerAuth('JWT')
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

  @Post(':id/certificado')
  @ApiOperation({ summary: 'Subir certificado digital .p12 / .pfx' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Certificado digital y contraseña del archivo P12/PFX',
    schema: {
      type: 'object',
      required: ['file', 'password'],
      properties: {
        file: { type: 'string', format: 'binary' },
        password: { type: 'string', format: 'password' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Certificado cargado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Certificado inválido o ausente' })
  @RequiredPermission('emisores', 'update')
  @UseInterceptors(FileInterceptor('file', EMISOR_CERTIFICATE_UPLOAD_OPTIONS))
  async uploadCertificado(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCertificadoDto,
  ): Promise<EmisorResponseDto> {
    if (!file) {
      throw new BadRequestException('El archivo del certificado es requerido');
    }

    return this.emisoresService.uploadCertificado(
      id,
      file.buffer,
      dto.password,
    );
  }

  @Delete(':id/certificado')
  @ApiOperation({ summary: 'Eliminar certificado digital actual' })
  @ApiResponse({
    status: 200,
    description: 'Certificado eliminado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'update')
  async deleteCertificado(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.deleteCertificado(id);
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
}
