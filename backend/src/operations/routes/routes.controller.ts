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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterReadingsDto } from './dto/filter-readings.dto';
import { FindAllRoutesDto } from './dto/find-all-routes.dto';
import { RouteEntity } from './types/route.entity';
import { ReadingForRouteEntity } from './types/reading-for-route.entity';

@ApiTags('routes')
@ApiBearerAuth()
@ApiExtraModels(RouteEntity, ReadingForRouteEntity)
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ReadingForRouteEntity) },
        },
        total: { type: 'number' },
      },
    },
  })
  @RequiredPermission('routes', 'read')
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
  @ApiResponse({
    status: 200,
    description: 'Lista de rutas',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(RouteEntity) },
        },
        total: { type: 'number' },
      },
    },
  })
  @RequiredPermission('rutas', 'read')
  @Get()
  async findAll(
    @Query() query: FindAllRoutesDto,
  ): Promise<{ data: RouteEntity[]; total: number }> {
    const where: any = {};
    if (query.estado) where.estado = query.estado;

    return this.routesService.findAll({
      skip: query.skip,
      take: query.take,
      where,
    });
  }

  /**
   * Obtener ruta por ID
   */
  @ApiOperation({
    summary: 'Obtener ruta por ID',
    description: 'Retorna una ruta específica',
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
