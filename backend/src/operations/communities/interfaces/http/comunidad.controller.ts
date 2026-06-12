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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';

@ApiTags('communities')
@ApiBearerAuth()
@ApiExtraModels(CommunityEntity, PaginationMetaDto)
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
    description: 'Retorna todas las comunidades sin sectores',
  })
  @ApiPaginatedResponse(CommunityEntity)
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('comunidades', 'read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.comunidadService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @ApiOperation({
    summary: 'Listar comunidades con sectores',
    description: 'Retorna comunidades con sus sectores relacionados',
  })
  @ApiQuery({
    name: 'sectorId',
    description: 'Filtrar comunidades por sector ID',
    required: false,
    type: Number,
  })
  @ApiPaginatedResponse(CommunityEntity)
  @ApiResponse({
    status: 200,
    description: 'Lista de comunidades con sectores',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('comunidades', 'read')
  @Get('with-sector')
  async findAllWithSector(
    @Query('sectorId') sectorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.comunidadService.findAllWithSector({
      sectorId: sectorId ? +sectorId : undefined,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @ApiOperation({
    summary: 'Obtener comunidad',
    description: 'Retorna una comunidad por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comunidad',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Comunidad encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @RequiredPermission('comunidades', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
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
