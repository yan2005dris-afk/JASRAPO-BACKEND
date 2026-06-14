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
import { ComunidadService } from '../../application/comunidad.service';
import { CreateComunidadDto } from '../dto/create-comunidad.dto';
import { UpdateComunidadDto } from '../dto/update-comunidad.dto';
import { CommunityFilterDto } from '../dto/community-filter.dto';
import { CommunityEntity } from '../../domain/entities/community.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';

@ApiTags('communities')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('communities')
export class ComunidadController {
  constructor(private readonly comunidadService: ComunidadService) {}

  @ApiOperation({
    summary: 'Crear comunidad',
    description: 'Crea una nueva comunidad',
  })
  @ApiBody({ type: CreateComunidadDto, description: 'Datos de la comunidad' })
  @ApiResponse({ status: 201, description: 'Comunidad creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso comunidades:create' })
  @RequiredPermission('comunidades', 'create')
  @Post()
  create(@Body() createComunidadDto: CreateComunidadDto) {
    return this.comunidadService.create(createComunidadDto);
  }

  @ApiOperation({
    summary: 'Listar comunidades',
    description:
      'Retorna todas las comunidades sin sectores, con filtros opcionales',
  })
  @ApiPaginatedResponse(CommunityEntity)
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('comunidades', 'read')
  @Get()
  async findAll(@Query() filters: CommunityFilterDto) {
    return this.comunidadService.findAll(
      filters.page ?? 1,
      filters.limit ?? 10,
      filters,
    );
  }

  @ApiOperation({
    summary: 'Obtener comunidad',
    description: 'Retorna una comunidad por ID con sus sectores',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comunidad',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Comunidad encontrada',
    type: CommunityEntity,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @RequiredPermission('comunidades', 'read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.comunidadService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Actualizar comunidad',
    description: 'Actualiza una comunidad',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comunidad',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateComunidadDto, description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Comunidad actualizada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso comunidades:update' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @RequiredPermission('comunidades', 'update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComunidadDto: UpdateComunidadDto,
  ) {
    return this.comunidadService.update(+id, updateComunidadDto);
  }

  @ApiOperation({
    summary: 'Eliminar comunidad',
    description: 'Elimina una comunidad (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comunidad',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Comunidad eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso comunidades:delete' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @RequiredPermission('comunidades', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.comunidadService.delete(+id);
  }
}
