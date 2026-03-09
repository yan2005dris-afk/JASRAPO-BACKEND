import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MinioService } from './minio.service';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly minioService: MinioService) {}

  /**
   * Sube un archivo a un bucket de MinIO.
   */
  @ApiOperation({
    summary: 'Subir un archivo',
    description:
      'Sube un archivo a MinIO en el bucket indicado. ' +
      'El bucket se crea automáticamente si no existe. ' +
      'Se genera un nombre único basado en timestamp para evitar colisiones.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'bucket',
    description: 'Nombre del bucket de destino',
    example: 'documents',
    required: true,
  })
  @ApiQuery({
    name: 'folder',
    description: 'Subdirectorio (prefijo) dentro del bucket',
    example: 'contratos/2026',
    required: false,
  })
  @ApiBody({
    description: 'Archivo a subir (máximo 10 MB)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    schema: {
      example: {
        message: 'Archivo subido exitosamente',
        bucket: 'documents',
        fileName: 'contratos/2026/1709834567890_contrato.pdf',
        originalName: 'contrato.pdf',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No se envió ningún archivo o bucket inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket: string,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }
    if (!bucket || !bucket.trim()) {
      throw new BadRequestException('El parámetro "bucket" es obligatorio');
    }

    const sanitizedBucket = bucket.trim().toLowerCase();
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = folder
      ? `${folder.replace(/\/+$/, '')}/${timestamp}_${safeOriginalName}`
      : `${timestamp}_${safeOriginalName}`;

    await this.minioService.uploadFile(sanitizedBucket, fileName, file.buffer);

    return {
      message: 'Archivo subido exitosamente',
      bucket: sanitizedBucket,
      fileName,
      originalName: file.originalname,
    };
  }

  /**
   * Sube múltiples archivos a un bucket.
   */
  @ApiOperation({
    summary: 'Subir múltiples archivos',
    description:
      'Sube hasta 10 archivos simultáneamente a un bucket de MinIO. ' +
      'Cada archivo recibe un nombre único basado en timestamp.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'bucket',
    description: 'Nombre del bucket de destino',
    example: 'documents',
    required: true,
  })
  @ApiQuery({
    name: 'folder',
    description: 'Subdirectorio (prefijo) dentro del bucket',
    example: 'facturas/marzo',
    required: false,
  })
  @ApiBody({
    description: 'Archivos a subir (máximo 10, cada uno hasta 10 MB)',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Archivos a subir',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivos subidos exitosamente',
    schema: {
      example: {
        message: '3 archivo(s) subidos exitosamente',
        bucket: 'documents',
        files: [
          { fileName: 'facturas/marzo/1709834567890_factura1.pdf', originalName: 'factura1.pdf' },
          { fileName: 'facturas/marzo/1709834567891_factura2.pdf', originalName: 'factura2.pdf' },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No se enviaron archivos o bucket inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('bucket') bucket: string,
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se enviaron archivos');
    }
    if (!bucket || !bucket.trim()) {
      throw new BadRequestException('El parámetro "bucket" es obligatorio');
    }

    const sanitizedBucket = bucket.trim().toLowerCase();
    const uploaded: { fileName: string; originalName: string }[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = folder
        ? `${folder.replace(/\/+$/, '')}/${timestamp}_${safeOriginalName}`
        : `${timestamp}_${safeOriginalName}`;

      await this.minioService.uploadFile(sanitizedBucket, fileName, file.buffer);
      uploaded.push({ fileName, originalName: file.originalname });
    }

    return {
      message: `${uploaded.length} archivo(s) subidos exitosamente`,
      bucket: sanitizedBucket,
      files: uploaded,
    };
  }

  /**
   * Obtiene una URL temporal (presigned) para descargar/ver un archivo.
   */
  @ApiOperation({
    summary: 'Obtener URL temporal de un archivo',
    description:
      'Genera una URL presigned (temporal, válida por 24 horas) para acceder ' +
      'directamente al archivo almacenado en MinIO sin autenticación adicional.',
  })
  @ApiParam({
    name: 'bucket',
    description: 'Nombre del bucket',
    example: 'documents',
  })
  @ApiParam({
    name: 'fileName',
    description: 'Nombre completo del archivo (incluyendo carpeta si aplica)',
    example: 'contratos/2026/1709834567890_contrato.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'URL temporal generada',
    schema: {
      example: {
        url: 'http://localhost:9000/documents/contratos/2026/1709834567890_contrato.pdf?X-Amz-Algorithm=...',
        expiresIn: '24 horas',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Get(':bucket/url/*fileName')
  async getPresignedUrl(
    @Param('bucket') bucket: string,
    @Param('fileName') fileName: string,
  ) {
    const url = await this.minioService.getPresignedUrl(bucket, fileName);
    return { url, expiresIn: '24 horas' };
  }

  /**
   * Lista archivos de un bucket (opcionalmente filtrados por prefijo).
   */
  @ApiOperation({
    summary: 'Listar archivos de un bucket',
    description:
      'Lista todos los archivos almacenados en un bucket de MinIO. ' +
      'Opcionalmente se puede filtrar por un prefijo (carpeta).',
  })
  @ApiParam({
    name: 'bucket',
    description: 'Nombre del bucket',
    example: 'documents',
  })
  @ApiQuery({
    name: 'prefix',
    description: 'Prefijo (carpeta) para filtrar archivos',
    example: 'contratos/2026',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos',
    schema: {
      example: {
        bucket: 'documents',
        prefix: 'contratos/2026',
        files: [
          'contratos/2026/1709834567890_contrato.pdf',
          'contratos/2026/1709834568000_anexo.pdf',
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Get(':bucket')
  async listFiles(
    @Param('bucket') bucket: string,
    @Query('prefix') prefix?: string,
  ) {
    const files = await this.minioService.listFiles(bucket, prefix);
    return { bucket, prefix: prefix || null, files };
  }

  /**
   * Elimina un archivo de un bucket.
   */
  @ApiOperation({
    summary: 'Eliminar un archivo',
    description: 'Elimina permanentemente un archivo de un bucket de MinIO.',
  })
  @ApiParam({
    name: 'bucket',
    description: 'Nombre del bucket',
    example: 'documents',
  })
  @ApiParam({
    name: 'fileName',
    description: 'Nombre completo del archivo (incluyendo carpeta si aplica)',
    example: 'contratos/2026/1709834567890_contrato.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente',
    schema: {
      example: { message: 'Archivo eliminado exitosamente' },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Delete(':bucket/*fileName')
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('fileName') fileName: string,
  ) {
    await this.minioService.deleteFile(bucket, fileName);
    return { message: 'Archivo eliminado exitosamente' };
  }
}
