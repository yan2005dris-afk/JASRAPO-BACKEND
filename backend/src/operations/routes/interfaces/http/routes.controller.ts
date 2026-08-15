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
import { ReassignRouteUseCase } from '../../application/use-cases/reassign-route.use-case';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { ReassignRouteDto } from '../dto/reassign-route.dto';
import { FilterReadingsDto } from '../dto/filter-readings.dto';
import { FindAllRoutesDto } from '../dto/find-all-routes.dto';
import {
  RouteResponseDto,
  ReadingForRouteResponseDto,
} from '../dto/route-response.dto';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';

@ApiTags('routes')
@ApiBearerAuth()
@ApiExtraModels(RouteResponseDto, ReadingForRouteResponseDto, PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('routes')
export class RoutesController {
  constructor(
    private readonly routesService: RoutesService,
    private readonly reassignRouteUseCase: ReassignRouteUseCase,
  ) {}

  /**
   * Obtener lecturas elegibles para crear una ruta
   */
  @ApiOperation({
    summary: 'Obtener lecturas elegibles para ruta',
    description:
      'Retorna las lecturas disponibles para asignar a una nueva ruta',
  })
  @ApiPaginatedResponse(ReadingForRouteResponseDto)
  @RequiredPermission('routes', 'read')
  @Get('eligible-readings')
  async getEligibleReadings(
    @Query() filterDto: FilterReadingsDto,
  ): Promise<PaginatedResult<ReadingForRouteResponseDto>> {
    const result = await this.routesService.getEligibleReadings(filterDto);
    return {
      data: ReadingForRouteResponseDto.fromEntityList(result.data),
      meta: result.meta,
    };
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
    type: RouteResponseDto,
  })
  @RequiredPermission('routes', 'create')
  @Post()
  async create(@Body() createDto: CreateRouteDto): Promise<RouteResponseDto> {
    const result = await this.routesService.create(createDto);
    return RouteResponseDto.fromEntity(result);
  }

  /**
   * Listar rutas con paginación
   */
  @ApiOperation({
    summary: 'Listar rutas',
    description: 'Retorna lista de rutas con paginación',
  })
  @ApiPaginatedResponse(RouteResponseDto)
  @RequiredPermission('routes', 'read')
  @Get()
  async findAll(
    @Query() query: FindAllRoutesDto,
  ): Promise<PaginatedResult<RouteResponseDto>> {
    const where: any = {};
    if (query.estado) where.estado = query.estado;

    const result = await this.routesService.findAll({
      pagination: {
        page: query.page,
        limit: query.limit,
      },
      where,
    });
    return {
      data: RouteResponseDto.fromEntityList(result.data),
      meta: result.meta,
    };
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
    description: 'ID de la ruta (bigint serializado como string)',
    type: String,
    example: '9223372036854775807',
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta encontrada',
    type: RouteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  @RequiredPermission('routes', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<RouteResponseDto> {
    const result = await this.routesService.findOne(id);
    return RouteResponseDto.fromEntity(result);
  }

  /**
   * Actualizar ruta
   */
  @ApiOperation({
    summary: 'Actualizar ruta',
    description: 'Actualiza los datos de una ruta existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la ruta (bigint serializado como string)',
    type: String,
    example: '9223372036854775807',
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta actualizada',
    type: RouteResponseDto,
  })
  @RequiredPermission('routes', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateDto: UpdateRouteDto,
  ): Promise<RouteResponseDto> {
    const result = await this.routesService.update(id, updateDto);
    return RouteResponseDto.fromEntity(result);
  }

  /**
   * Reassign route to a different operator
   */
  @ApiOperation({
    summary: 'Reasignar ruta',
    description: 'Reasigna una ruta a un operario diferente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la ruta (bigint serializado como string)',
    type: String,
    example: '9223372036854775807',
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta reasignada',
    type: RouteResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'La ruta ya pertenece a este operario',
  })
  @ApiResponse({ status: 404, description: 'Ruta u operario no encontrado' })
  @RequiredPermission('routes', 'update')
  @Patch(':id/reassign')
  async reassign(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: ReassignRouteDto,
  ): Promise<RouteResponseDto> {
    const result = await this.reassignRouteUseCase.execute(id, dto.operarioId);
    return RouteResponseDto.fromEntity(result);
  }

  /**
   * Eliminar ruta (Soft Delete)
   */
  @ApiOperation({
    summary: 'Eliminar ruta',
    description: 'Elimina una ruta y desasigna sus lecturas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la ruta (bigint serializado como string)',
    type: String,
    example: '9223372036854775807',
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta eliminada',
    type: RouteResponseDto,
  })
  @RequiredPermission('routes', 'delete')
  @Delete(':id')
  async delete(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<RouteResponseDto> {
    const result = await this.routesService.delete(id);
    return RouteResponseDto.fromEntity(result);
  }
}
