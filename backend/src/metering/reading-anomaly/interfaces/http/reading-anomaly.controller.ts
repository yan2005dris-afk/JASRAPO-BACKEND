import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createImageFileFilter } from 'src/infrastructure/common/utils/evidence-upload.util';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { ReadingAnomalyService } from '../../application/reading-anomaly.service';
import { CreateReadingAnomalyDto } from '../dto/create-reading-anomaly.dto';
import { UpdateReadingAnomalyDto } from '../dto/update-reading-anomaly.dto';
import {
  ResponseReadingAnomalyDto,
  ReadingAnomalyFilterDto,
} from '../dto/response-reading-anomaly.dto';
import { TipoAnomalia, EstadoAnomalia } from 'src/shared/enums';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ReadingAnomalyFilters } from '../../domain/repositories/reading-anomaly.repository';
import {
  EnumStateDto,
  buildStateCatalog,
} from 'src/shared/enums/state-catalog';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';

@ApiTags('reading-anomalies')
@ApiBearerAuth()
@Controller('reading-anomalies')
export class ReadingAnomalyController {
  constructor(private readonly readingAnomalyService: ReadingAnomalyService) {}

  @ApiOperation({
    summary: 'Crear anomalía de lectura',
    description: 'Registra una anomalía encontrada al tomar una lectura',
  })
  @ApiBody({
    type: CreateReadingAnomalyDto,
    description: 'Datos de la anomalía',
  })
  @ApiResponse({
    status: 201,
    description: 'Anomalía creada',
    type: ResponseReadingAnomalyDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permiso reading-anomalies:create',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @RequiredPermission('reading-anomalies', 'create')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: createImageFileFilter(),
    }),
  )
  async create(
    @Body() createDto: CreateReadingAnomalyDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseReadingAnomalyDto> {
    return ResponseReadingAnomalyDto.fromEntity(
      await this.readingAnomalyService.create(createDto, file),
    )!;
  }

  @ApiOperation({
    summary: 'Listar anomalías de lecturas',
    description: 'Retorna lista de anomalías con paginación',
  })
  @ApiQuery({
    name: 'lecturaId',
    description: 'Filtrar por ID de lectura',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'tipo',
    description: 'Filtrar por tipo',
    enum: TipoAnomalia,
    required: false,
  })
  @ApiQuery({
    name: 'estado',
    description: 'Filtrar por estado',
    enum: EstadoAnomalia,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de anomalías',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('reading-anomalies', 'read')
  @Get()
  async findAll(@Query() filtersDto: ReadingAnomalyFilterDto) {
    const filters: ReadingAnomalyFilters = {};
    if (filtersDto.search?.trim()) {
      filters.search = filtersDto.search.trim();
    }
    if (filtersDto.lecturaId) {
      filters.lecturaId = BigInt(filtersDto.lecturaId);
    }
    if (filtersDto.tipo) {
      filters.tipo = filtersDto.tipo;
    }
    if (filtersDto.estado) {
      filters.estado = filtersDto.estado;
    }

    const result = await this.readingAnomalyService.findAll(
      filtersDto.page,
      filtersDto.limit,
      filters,
    );
    return {
      data: result.data.map((x) => ResponseReadingAnomalyDto.fromEntity(x)!),
      meta: result.meta,
    };
  }

  @ApiOperation({
    summary: 'Catálogo de estados de anomalía',
    description:
      'Retorna todos los estados posibles de una anomalía de lectura (EstadoAnomalia).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados',
    type: [EnumStateDto],
  })
  @Get('estados')
  getEstados(): EnumStateDto[] {
    return buildStateCatalog(
      EstadoAnomalia,
      {
        PENDIENTE: 'Pendiente',
        EN_REVISION: 'En Revisión',
        RESUELTA: 'Resuelta',
        DESCARTADA: 'Descartada',
      },
      {
        PENDIENTE: 'bi-flag',
        EN_REVISION: 'bi-search',
        RESUELTA: 'bi-check-circle',
        DESCARTADA: 'bi-x-circle',
      },
    );
  }

  @ApiOperation({
    summary: 'Obtener anomalía de lectura',
    description: 'Retorna una anomalía por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la anomalía',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Anomalía encontrada',
    type: ResponseReadingAnomalyDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Anomalía no encontrada' })
  @RequiredPermission('reading-anomalies', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ResponseReadingAnomalyDto> {
    return ResponseReadingAnomalyDto.fromEntity(
      await this.readingAnomalyService.findOne(id),
    )!;
  }

  @ApiOperation({
    summary: 'Actualizar anomalía de lectura',
    description: 'Actualiza una anomalía',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la anomalía',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateReadingAnomalyDto,
    description: 'Datos a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Anomalía actualizada',
    type: ResponseReadingAnomalyDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permiso reading-anomalies:update',
  })
  @ApiResponse({ status: 404, description: 'Anomalía no encontrada' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @RequiredPermission('reading-anomalies', 'update')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: createImageFileFilter(),
    }),
  )
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateDto: UpdateReadingAnomalyDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseReadingAnomalyDto> {
    return ResponseReadingAnomalyDto.fromEntity(
      await this.readingAnomalyService.update(id, updateDto, file),
    )!;
  }

  @ApiOperation({
    summary: 'Eliminar anomalía de lectura',
    description: 'Elimina una anomalía (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la anomalía',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Anomalía eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permiso reading-anomalies:delete',
  })
  @ApiResponse({ status: 404, description: 'Anomalía no encontrada' })
  @RequiredPermission('reading-anomalies', 'delete')
  @Delete(':id')
  async delete(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.readingAnomalyService.delete(id);
  }
}
