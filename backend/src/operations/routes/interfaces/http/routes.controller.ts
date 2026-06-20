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
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RoutesService } from '../../application/routes.service';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { FilterReadingsDto } from '../dto/filter-readings.dto';
import { FindAllRoutesDto } from '../dto/find-all-routes.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';

@ApiTags('routes')
@ApiBearerAuth()
@ApiExtraModels(RouteEntity, ReadingForRouteEntity, PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  /**
   * Obtener lecturas elegibles para crear una ruta
   */
  @ApiOperation({
    summary: 'Obtener lecturas elegibles para ruta',
    description:
      'Retorna las lecturas disponibles para asignar a una nueva ruta',
  })
  @ApiPaginatedResponse(ReadingForRouteEntity)
  @RequiredPermission('routes', 'read')
  @Get('eligible-readings')
  async getEligibleReadings(
    @Query() filterDto: FilterReadingsDto,
  ): Promise<PaginatedResult<ReadingForRouteEntity>> {
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
  @RequiredPermission('routes', 'create')
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
  @ApiPaginatedResponse(RouteEntity)
  @RequiredPermission('routes', 'read')
  @Get()
  async findAll(
    @Query() query: FindAllRoutesDto,
  ): Promise<PaginatedResult<RouteEntity>> {
    const where: any = {};
    if (query.estado) where.estado = query.estado;

    return this.routesService.findAll({
      pagination: {
        page: query.page,
        limit: query.limit,
      },
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
  @ApiParam({ name: 'id', description: 'ID de la ruta', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Ruta encontrada',
    type: RouteEntity,
  })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  @RequiredPermission('routes', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<RouteEntity> {
    return this.routesService.findOne(id);
  }

  /**
   * Actualizar ruta
   */
  @ApiOperation({
    summary: 'Actualizar ruta',
    description: 'Actualiza los datos de una ruta existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la ruta', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Ruta actualizada',
    type: RouteEntity,
  })
  @RequiredPermission('routes', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateDto: UpdateRouteDto,
  ): Promise<RouteEntity> {
    return this.routesService.update(id, updateDto);
  }

  /**
   * Eliminar ruta (Soft Delete)
   */
  @ApiOperation({
    summary: 'Eliminar ruta',
    description: 'Elimina una ruta y desasigna sus lecturas',
  })
  @ApiParam({ name: 'id', description: 'ID de la ruta', type: Number })
  @ApiResponse({ status: 200, description: 'Ruta eliminada' })
  @RequiredPermission('routes', 'delete')
  @Delete(':id')
  async delete(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<{ message: string }> {
    return this.routesService.delete(id);
  }
}
