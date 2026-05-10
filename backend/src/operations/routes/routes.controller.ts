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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterReadingsDto } from './dto/filter-readings.dto';
import { RouteEntity } from './types/route.entity';
import { ReadingForRouteEntity } from './types/reading-for-route.entity';

@ApiTags('routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  /**
   * Obtener lecturas elegibles para crear una ruta
   * Filtra por tipo, comunidad y sector
   */
  @ApiOperation({
    summary: 'Obtener lecturas elegibles para ruta',
    description:
      'Retorna las lecturas disponibles para asignar a una nueva ruta',
  })
  @ApiQuery({ name: 'tipoRuta', enum: ['TOMA_LECTURA', 'RECONEXION'] })
  @ApiQuery({ name: 'comunidadId', type: Number })
  @ApiQuery({ name: 'sectorId', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'take', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lecturas elegibles obtenidas',
    isArray: true,
  })
  @RequiredPermission('rutas', 'read')
  @Get('eligible-readings')
  async getEligibleReadings(
    @Query() filterDto: FilterReadingsDto,
  ): Promise<{ data: ReadingForRouteEntity[]; total: number }> {
    return this.routesService.getEligibleReadings(filterDto);
  }

  /**
   * Crear nueva ruta
   */
  @ApiOperation({
    summary: 'Crear nueva ruta',
    description: 'Crea una nueva ruta de trabajo asignando guías',
  })
  @ApiResponse({
    status: 201,
    description: 'Ruta creada exitosamente',
    type: RouteEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso rutas:create' })
  @RequiredPermission('rutas', 'create')
  @Post()
  async create(@Body() createDto: CreateRouteDto): Promise<RouteEntity> {
    return this.routesService.create(createDto);
  }

  /**
   * Listar rutas con paginación
   */
  @ApiOperation({
    summary: 'Listar rutas',
    description: 'Retorna lista de rutas con paginación',
  })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'take', type: Number, required: false })
  @ApiQuery({ name: 'estado', type: String, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de rutas',
    type: [RouteEntity],
  })
  @RequiredPermission('rutas', 'read')
  @Get()
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('estado') estado?: string,
  ): Promise<{ data: RouteEntity[]; total: number }> {
    const where: any = {};
    if (estado) where.estado = estado;

    return this.routesService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  /**
   * Obtener ruta por ID
   */
  @ApiOperation({
    summary: 'Obtener ruta por ID',
    description: 'Retorna una ruta específica con sus lecturas asignadas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la ruta',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta encontrada',
    type: RouteEntity,
  })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  @RequiredPermission('rutas', 'read')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RouteEntity> {
    return this.routesService.findOne(BigInt(id));
  }

  /**
   * Actualizar ruta
   */
  @ApiOperation({
    summary: 'Actualizar ruta',
    description: 'Actualiza los datos de una ruta existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la ruta', type: String })
  @ApiResponse({
    status: 200,
    description: 'Ruta actualizada',
    type: RouteEntity,
  })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  @RequiredPermission('rutas', 'update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRouteDto,
  ): Promise<RouteEntity> {
    return this.routesService.update(BigInt(id), updateDto);
  }

  /**
   * Eliminar ruta (Soft Delete)
   */
  @ApiOperation({
    summary: 'Eliminar ruta',
    description: 'Elimina una ruta y desasigna sus lecturas',
  })
  @ApiParam({ name: 'id', description: 'ID de la ruta', type: String })
  @ApiResponse({ status: 200, description: 'Ruta eliminada' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  @RequiredPermission('rutas', 'delete')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.routesService.delete(BigInt(id));
  }
}
