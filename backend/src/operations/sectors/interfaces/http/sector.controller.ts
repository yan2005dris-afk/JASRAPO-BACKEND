import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SectorService } from '../../application/sector.service';
import { CreateSectorDto } from '../dto/create-sector.dto';
import { UpdateSectorDto } from '../dto/update-sector.dto';
import { SectorResponseDto } from '../dto/sector-response.dto';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
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
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@ApiTags('sectors')
@ApiBearerAuth()
@ApiExtraModels(SectorResponseDto, PaginationMetaDto)
@Controller('sectors')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @ApiOperation({
    summary: 'Crear sector',
    description: 'Crea un nuevo sector territorial',
  })
  @ApiBody({ type: CreateSectorDto, description: 'Datos del sector' })
  @ApiResponse({
    status: 201,
    description: 'Sector creado',
    type: SectorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso sectores:create' })
  @RequiredPermission('sectores', 'create')
  @Post()
  async create(
    @Body() createSectorDto: CreateSectorDto,
  ): Promise<SectorResponseDto> {
    const result = await this.sectorService.crearSector(createSectorDto);
    return SectorResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Listar sectores',
    description: 'Retorna todos los sectores con paginación',
  })
  @ApiPaginatedResponse(SectorResponseDto)
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('sectores', 'read')
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<SectorResponseDto>> {
    const result = await this.sectorService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
    return {
      data: SectorResponseDto.fromEntityList(result.data),
      meta: result.meta,
    };
  }

  @ApiOperation({
    summary: 'Obtener sector',
    description: 'Retorna un sector por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del sector',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sector encontrado',
    type: SectorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @RequiredPermission('sectores', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SectorResponseDto> {
    const result = await this.sectorService.findOne(id);
    return SectorResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Actualizar sector',
    description: 'Actualiza un sector',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del sector',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateSectorDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Sector actualizado',
    type: SectorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso sectores:update' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @RequiredPermission('sectores', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectorDto: UpdateSectorDto,
  ): Promise<SectorResponseDto> {
    const result = await this.sectorService.actualizarSector(
      id,
      updateSectorDto,
    );
    return SectorResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Eliminar sector',
    description: 'Elimina un sector (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del sector',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sector eliminado',
    type: SectorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso sectores:delete' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @RequiredPermission('sectores', 'delete')
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SectorResponseDto> {
    const result = await this.sectorService.eliminarSector(id);
    return SectorResponseDto.fromEntity(result);
  }
}
