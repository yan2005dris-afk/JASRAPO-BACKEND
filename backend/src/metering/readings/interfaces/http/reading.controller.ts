import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { NotEmptyBodyPipe } from 'src/infrastructure/common/pipes/not-empty-body.pipe';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { ParseActualizarLecturaPipe } from 'src/infrastructure/common/pipes/parse-actualizar-lectura.pipe';
import { ReadingService } from '../../application/reading.service';
import { ActualizarLecturaDto } from '../dto/update-lectura.dto';
import { ResponseReadingDto } from '../dto/response-reading.dto';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ReadingFilters } from '../../domain/repositories/reading.repository';
import {
  EnumStateDto,
  buildStateCatalog,
} from 'src/shared/enums/state-catalog';
import { EstadoLectura } from 'src/shared/enums';

@ApiTags('readings')
@ApiBearerAuth()
@Controller('readings')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @ApiOperation({
    summary: 'Listar lecturas',
    description: 'Retorna lista de lecturas con paginación',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'contratoId', required: false, type: String })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoLectura })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de lecturas paginada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('lecturas', 'read')
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('contratoId') contratoId?: string,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
  ) {
    const filters: ReadingFilters = {};
    if (contratoId) filters.contratoId = BigInt(contratoId);
    if (estado) filters.estado = estado;
    if (search) filters.search = search;
    const result = await this.readingService.findAll(
      paginationDto.page,
      paginationDto.limit,
      filters,
    );
    return {
      data: result.data.map((x) => ResponseReadingDto.fromEntity(x)!),
      meta: result.meta,
    };
  }

  @ApiOperation({ summary: 'Catálogo de estados de lectura' })
  @ApiResponse({ status: 200, type: [EnumStateDto] })
  @RequiredPermission('lecturas', 'read')
  @Get('estados')
  getEstados(): EnumStateDto[] {
    return buildStateCatalog(
      EstadoLectura,
      {
        PENDIENTE: 'Pendiente',
        POR_REVISION: 'Por Revisión',
        APROBADA: 'Aprobada',
        RECHAZADA_VERIFICACION: 'Rechazada',
        ESTIMADA: 'Estimada',
        PLANILLADA: 'Planillada',
        CON_NOVEDAD: 'Con Novedad',
      },
      {
        PENDIENTE: 'bi-clock',
        POR_REVISION: 'bi-eye',
        APROBADA: 'bi-check-circle',
        RECHAZADA_VERIFICACION: 'bi-x-circle-fill',
        ESTIMADA: 'bi-graph-up',
        PLANILLADA: 'bi-receipt',
        CON_NOVEDAD: 'bi-exclamation-triangle',
      },
    );
  }

  @ApiOperation({
    summary: 'Obtener lectura',
    description: 'Retorna una lectura por ID',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura', type: Number })
  @ApiResponse({ status: 200, type: ResponseReadingDto })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ResponseReadingDto> {
    return ResponseReadingDto.fromEntity(
      await this.readingService.findOne(id),
    )!;
  }

  @ApiOperation({
    summary: 'Actualizar lectura',
    description: 'Actualiza campos no fotográficos de una lectura',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ActualizarLecturaDto })
  @ApiResponse({ status: 200, type: ResponseReadingDto })
  @RequiredPermission('lecturas', 'update')
  @Patch(':id')
  async actualizarLectura(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body(new NotEmptyBodyPipe(), new ParseActualizarLecturaPipe())
    updateLecturaDto: ActualizarLecturaDto,
  ): Promise<ResponseReadingDto> {
    return ResponseReadingDto.fromEntity(
      await this.readingService.update(id, updateLecturaDto),
    )!;
  }

  @ApiOperation({
    summary: 'Eliminar lectura',
    description: 'Elimina una lectura (soft delete)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Lectura eliminada' })
  @RequiredPermission('lecturas', 'delete')
  @Delete(':id')
  async eliminarLectura(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.readingService.delete(id);
  }
}
