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
import { ReadingService } from '../../application/reading.service';
import { CrearLecturaDto } from '../dto/create-lectura.dto';
import { ActualizarLecturaDto } from '../dto/update-lectura.dto';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
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
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';

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
    type: LecturaEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:create' })
  @RequiredPermission('lecturas', 'create')
  @Post()
  async create(
    @Body() crearLecturaDto: CrearLecturaDto,
  ): Promise<LecturaEntity> {
    return this.readingService.create(crearLecturaDto);
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
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('contratoId') contratoId?: string,
  ): Promise<LecturaEntity[]> {
    const where: any = {};
    if (contratoId) {
      where.medidor = {
        historial: {
          some: {
            contratoId: BigInt(contratoId),
            fechaHasta: null,
          },
        },
      };
    }
    return this.readingService.findAll({
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
  async findOne(@Param('id') id: string): Promise<LecturaEntity> {
    return this.readingService.findOne(BigInt(id));
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
    return this.readingService.update(BigInt(id), updateLecturaDto);
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
    return this.readingService.delete(BigInt(id));
  }
}
