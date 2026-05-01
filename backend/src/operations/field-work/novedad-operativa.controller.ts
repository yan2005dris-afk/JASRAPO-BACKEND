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
import { NovedadOperativaService } from './novedad-operativa.service';
import { CrearNovedadOperativaDto } from './dto/create-novedad-operativa.dto';
import { ActualizarNovedadOperativaDto } from './dto/update-novedad-operativa.dto';
import { NovedadOperativaEntity } from './entities/novedad-operativa.entity';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/client';
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

@ApiTags('field-notes')
@ApiBearerAuth()
@Controller('field-notes')
export class NovedadOperativaController {
  constructor(
    private readonly novedadOperativaService: NovedadOperativaService,
  ) {}

  @ApiOperation({
    summary: 'Crear nota de campo',
    description: 'Registra una nueva nota operativa',
  })
  @ApiBody({ type: CrearNovedadOperativaDto, description: 'Datos de la nota' })
  @ApiResponse({
    status: 201,
    description: 'Nota creada',
    type: NovedadOperativaEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso field-notes:create' })
  @RequiredPermission('field-notes', 'create')
  @Post()
  async crearNovedadOperativa(
    @Body() createDto: CrearNovedadOperativaDto,
  ): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.crearNovedadOperativa(createDto);
  }

  @ApiOperation({
    summary: 'Listar notas de campo',
    description: 'Retorna lista de notas con filtros',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Registros a omitir',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    description: 'Límite de registros',
    required: false,
    type: Number,
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
    enum: TipoNovedad,
    required: false,
  })
  @ApiQuery({
    name: 'estado',
    description: 'Filtrar por estado',
    enum: EstadoNovedad,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notas',
    type: [NovedadOperativaEntity],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('field-notes', 'read')
  @Get()
  async buscarNovedades(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('lecturaId') lecturaId?: string,
    @Query('tipo') tipo?: TipoNovedad,
    @Query('estado') estado?: EstadoNovedad,
  ): Promise<NovedadOperativaEntity[]> {
    const where: any = {};
    if (lecturaId) where.lecturaId = BigInt(lecturaId);
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;

    return this.novedadOperativaService.buscarNovedades({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  @ApiOperation({
    summary: 'Obtener nota de campo',
    description: 'Retorna una nota por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la nota',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota encontrada',
    type: NovedadOperativaEntity,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @RequiredPermission('field-notes', 'read')
  @Get(':id')
  async buscarNovedad(
    @Param('id') id: string,
  ): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.buscarNovedad(BigInt(id));
  }

  @ApiOperation({
    summary: 'Actualizar nota de campo',
    description: 'Actualiza una nota',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la nota',
    type: String,
    example: '1',
  })
  @ApiBody({
    type: ActualizarNovedadOperativaDto,
    description: 'Datos a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota actualizada',
    type: NovedadOperativaEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso field-notes:update' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @RequiredPermission('field-notes', 'update')
  @Patch(':id')
  async actualizarNovedad(
    @Param('id') id: string,
    @Body() updateDto: ActualizarNovedadOperativaDto,
  ): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.actualizarNovedad(
      BigInt(id),
      updateDto,
    );
  }

  @ApiOperation({
    summary: 'Eliminar nota de campo',
    description: 'Elimina una nota (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la nota',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Nota eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso field-notes:delete' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @RequiredPermission('field-notes', 'delete')
  @Delete(':id')
  async eliminarNovedad(@Param('id') id: string) {
    return this.novedadOperativaService.eliminarNovedad(BigInt(id));
  }
}
