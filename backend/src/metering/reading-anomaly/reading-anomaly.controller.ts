import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReadingAnomalyService } from './reading-anomaly.service';
import { CreateReadingAnomalyDto } from './dto/create-reading-anomaly.dto';
import { UpdateReadingAnomalyDto } from './dto/update-reading-anomaly.dto';
import { ResponseReadingAnomalyDto } from './dto/response-reading-anomaly.dto';
import { TipoAnomalia, EstadoAnomalia } from 'src/generated/prisma/client';
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
    type: ResponseReadingAnomalyDto as any,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permiso reading-anomalies:create',
  })
  @RequiredPermission('reading-anomalies', 'create')
  @Post()
  async create(
    @Body() createDto: CreateReadingAnomalyDto,
  ): Promise<ResponseReadingAnomalyDto> {
    return this.readingAnomalyService.create(createDto);
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
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('lecturaId') lecturaId?: string,
    @Query('tipo') tipo?: TipoAnomalia,
    @Query('estado') estado?: EstadoAnomalia,
  ) {
    const where: any = {};
    if (lecturaId) where.lecturaId = BigInt(lecturaId);
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;

    return this.readingAnomalyService.findAll(
      paginationDto.page,
      paginationDto.limit,
      where,
    );
  }

  @ApiOperation({
    summary: 'Obtener anomalía de lectura',
    description: 'Retorna una anomalía por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la anomalía',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Anomalía encontrada',
    type: ResponseReadingAnomalyDto as any,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Anomalía no encontrada' })
  @RequiredPermission('reading-anomalies', 'read')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseReadingAnomalyDto> {
    return this.readingAnomalyService.findOne(BigInt(id));
  }

  @ApiOperation({
    summary: 'Actualizar anomalía de lectura',
    description: 'Actualiza una anomalía',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la anomalía',
    type: String,
    example: '1',
  })
  @ApiBody({
    type: UpdateReadingAnomalyDto,
    description: 'Datos a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Anomalía actualizada',
    type: ResponseReadingAnomalyDto as any,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permiso reading-anomalies:update',
  })
  @ApiResponse({ status: 404, description: 'Anomalía no encontrada' })
  @RequiredPermission('reading-anomalies', 'update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateReadingAnomalyDto,
  ): Promise<ResponseReadingAnomalyDto> {
    return this.readingAnomalyService.update(BigInt(id), updateDto);
  }

  @ApiOperation({
    summary: 'Eliminar anomalía de lectura',
    description: 'Elimina una anomalía (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la anomalía',
    type: String,
    example: '1',
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
  async delete(@Param('id') id: string) {
    return this.readingAnomalyService.delete(BigInt(id));
  }
}
