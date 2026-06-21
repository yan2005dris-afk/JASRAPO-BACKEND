import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotEmptyBodyPipe } from 'src/infrastructure/common/pipes/not-empty-body.pipe';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { ParseActualizarLecturaPipe } from 'src/infrastructure/common/pipes/parse-actualizar-lectura.pipe';
import { ReadingService } from '../../application/reading.service';
import { CrearLecturaDto } from '../dto/create-lectura.dto';
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
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { toReadingResponse } from '../../types/readingMapper';
import { ReadingFilters } from '../../domain/repositories/reading.repository';
import {
  EnumStateDto,
  buildStateCatalog,
} from 'src/shared/enums/state-catalog';
import { EstadoLectura } from 'src/shared/enums';

@ApiTags('readings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('readings')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @ApiOperation({
    summary: 'Crear lectura',
    description: 'Registra una nueva lectura de medidor',
  })
  @ApiBody({ type: CrearLecturaDto, description: 'Datos de la lectura' })
  @ApiResponse({
    status: 201,
    description: 'Lectura creada',
    type: ResponseReadingDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:create' })
  @RequiredPermission('lecturas', 'create')
  @Post()
  async create(
    @Body() crearLecturaDto: CrearLecturaDto,
  ): Promise<ResponseReadingDto> {
    return toReadingResponse(
      await this.readingService.create(crearLecturaDto),
    )!;
  }

  @ApiOperation({
    summary: 'Listar lecturas',
    description: 'Retorna lista de lecturas con paginación',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página (empieza en 1)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Registros por página (máx 100)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'contratoId',
    description: 'Filtrar por ID de contrato',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecturas paginada',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('lecturas', 'read')
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('contratoId') contratoId?: string,
  ) {
    const filters: ReadingFilters = {};
    if (contratoId) {
      filters.contratoId = BigInt(contratoId);
    }
    const result = await this.readingService.findAll(
      paginationDto.page,
      paginationDto.limit,
      filters,
    );
    return {
      data: result.data.map((x) => toReadingResponse(x)!),
      meta: result.meta,
    };
  }

  @ApiOperation({
    summary: 'Catálogo de estados de lectura',
    description:
      'Retorna todos los estados posibles de una lectura (EstadoLectura).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados',
    type: [EnumStateDto],
  })
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
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lectura encontrada',
    type: ResponseReadingDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ResponseReadingDto> {
    return toReadingResponse(await this.readingService.findOne(id))!;
  }

  @ApiOperation({
    summary: 'Actualizar lectura',
    description: 'Actualiza una lectura',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: ActualizarLecturaDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Lectura actualizada',
    type: ResponseReadingDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:update' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'update')
  @Patch(':id')
  async actualizarLectura(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body(new NotEmptyBodyPipe(), new ParseActualizarLecturaPipe())
    updateLecturaDto: ActualizarLecturaDto,
  ): Promise<ResponseReadingDto> {
    return toReadingResponse(
      await this.readingService.update(id, updateLecturaDto),
    )!;
  }

  @ApiOperation({
    summary: 'Eliminar lectura',
    description: 'Elimina una lectura (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Lectura eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:delete' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'delete')
  @Delete(':id')
  async eliminarLectura(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.readingService.delete(id);
  }
}
