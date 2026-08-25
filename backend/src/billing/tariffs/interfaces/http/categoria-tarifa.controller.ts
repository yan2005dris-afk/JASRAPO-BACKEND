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
import { CategoriaTarifaService } from '../../application/categoria-tarifa.service';
import { CreateCategoriaTarifaDto } from '../dto/create-categoria-tarifa.dto';
import { UpdateCategoriaTarifaDto } from '../dto/update-categoria-tarifa.dto';
import { TariffCategoryFilterDto } from '../dto/tariff-category-filter.dto';
import { TariffCategoryResponseDto } from '../dto/tariff-category-response.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@ApiTags('tariff-categories')
@ApiBearerAuth()
@Controller('tariff-categories')
export class CategoriaTarifaController {
  constructor(private readonly service: CategoriaTarifaService) {}

  @ApiOperation({ summary: 'Crear categoría tarifa' })
  @ApiResponse({
    status: 201,
    description: 'Creada correctamente',
    type: TariffCategoryResponseDto,
  })
  @RequiredPermission('tarifas', 'create')
  @Post()
  async create(
    @Body() dto: CreateCategoriaTarifaDto,
  ): Promise<TariffCategoryResponseDto> {
    const entity = await this.service.createCategoria(dto);
    return TariffCategoryResponseDto.fromEntity(entity);
  }

  @ApiOperation({
    summary: 'Obtener todas las categorías activas con paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de categorías',
  })
  @RequiredPermission('tarifas', 'read')
  @Get()
  async findAll(
    @Query() filterDto: TariffCategoryFilterDto,
  ): Promise<PaginatedResult<TariffCategoryResponseDto>> {
    const result = await this.service.getCategorias(
      filterDto.page,
      filterDto.limit,
      filterDto.nombre,
    );
    return {
      data: TariffCategoryResponseDto.fromEntityList(result.data),
      meta: result.meta,
    };
  }

  @ApiOperation({ summary: 'Obtener una categoría de tarifa por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría de tarifa',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: TariffCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @RequiredPermission('tarifas', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TariffCategoryResponseDto> {
    const entity = await this.service.findOneCategoria(id);
    return TariffCategoryResponseDto.fromEntity(entity);
  }

  @ApiOperation({ summary: 'Actualizar categoría (crea nueva versión)' })
  @ApiResponse({
    status: 200,
    description: 'Nueva versión creada correctamente',
    type: TariffCategoryResponseDto,
  })
  @RequiredPermission('tarifas', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaTarifaDto,
  ): Promise<TariffCategoryResponseDto> {
    const entity = await this.service.updateCategoria(id, dto);
    return TariffCategoryResponseDto.fromEntity(entity);
  }

  @ApiOperation({ summary: 'Eliminar categoría (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Categoría eliminada exitosamente',
    type: TariffCategoryResponseDto,
  })
  @RequiredPermission('tarifas', 'delete')
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TariffCategoryResponseDto> {
    const entity = await this.service.deleteCategoria(id);
    return TariffCategoryResponseDto.fromEntity(entity);
  }
}
