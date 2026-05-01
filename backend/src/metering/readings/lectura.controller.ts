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
import { LecturaService } from './lectura.service';
import { CrearLecturaDto } from './dto/create-lectura.dto';
import { ActualizarLecturaDto } from './dto/update-lectura.dto';
import { LecturaEntity } from './entities/lectura.entity';
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

@ApiTags('readings')
@ApiBearerAuth()
@Controller('readings')
export class LecturaController {
  constructor(private readonly lecturaService: LecturaService) {}

  @ApiOperation({
    summary: 'Crear lectura',
    description: 'Registra una nueva lectura de medidor',
  })
  @ApiBody({ type: CrearLecturaDto, description: 'Datos de la lectura' })
  @ApiResponse({
    status: 201,
    description: 'Lectura creada',
    type: LecturaEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:create' })
  @RequiredPermission('lecturas', 'create')
  @Post('create')
  async create(
    @Body() crearLecturaDto: CrearLecturaDto,
  ): Promise<LecturaEntity> {
    return this.lecturaService.crearLectura(crearLecturaDto);
  }

  @ApiOperation({
    summary: 'Listar lecturas',
    description: 'Retorna lista de lecturas con paginación',
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
    name: 'contratoId',
    description: 'Filtrar por ID de contrato',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecturas',
    type: [LecturaEntity],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('lecturas', 'read')
  @Get()
  async buscarLecturas(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('contratoId') contratoId?: string,
  ): Promise<LecturaEntity[]> {
    const where: any = {};
    if (contratoId) where.contratoId = BigInt(contratoId);
    return this.lecturaService.buscarLecturas({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  @ApiOperation({
    summary: 'Obtener lectura',
    description: 'Retorna una lectura por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lectura encontrada',
    type: LecturaEntity,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'read')
  @Get(':id')
  async buscarLectura(@Param('id') id: string): Promise<LecturaEntity> {
    return this.lecturaService.buscarLectura(BigInt(id));
  }

  @ApiOperation({
    summary: 'Actualizar lectura',
    description: 'Actualiza una lectura',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: String,
    example: '1',
  })
  @ApiBody({ type: ActualizarLecturaDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Lectura actualizada',
    type: LecturaEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:update' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'update')
  @Patch(':id')
  async actualizarLectura(
    @Param('id') id: string,
    @Body() updateLecturaDto: ActualizarLecturaDto,
  ): Promise<LecturaEntity> {
    return this.lecturaService.actualizarLectura(BigInt(id), updateLecturaDto);
  }

  @ApiOperation({
    summary: 'Eliminar lectura',
    description: 'Elimina una lectura (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Lectura eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:delete' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'delete')
  @Delete(':id')
  async eliminarLectura(@Param('id') id: string) {
    return this.lecturaService.eliminarLectura(BigInt(id));
  }
}
