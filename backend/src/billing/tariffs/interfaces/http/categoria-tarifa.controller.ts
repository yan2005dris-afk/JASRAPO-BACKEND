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
import { CategoriaTarifaService } from '../../application/categoria-tarifa.service';
import { CreateCategoriaTarifaDto } from '../dto/create-categoria-tarifa.dto';
import { UpdateCategoriaTarifaDto } from '../dto/update-categoria-tarifa.dto';
import { TariffCategoryFilterDto } from '../dto/tariff-category-filter.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';

@ApiTags('tariffs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tariff-categories')
export class CategoriaTarifaController {
  constructor(private readonly service: CategoriaTarifaService) {}

  @ApiOperation({ summary: 'Crear categoría tarifa' })
  @ApiResponse({ status: 201, description: 'Creada correctamente' })
  @RequiredPermission('tarifas', 'create')
  @Post()
  create(@Body() dto: CreateCategoriaTarifaDto) {
    return this.service.createCategoria(dto);
  }

  // LISTADO PRINCIPAL
  @ApiOperation({
    summary: 'Obtener todas las categorías activas con paginación',
  })
  @RequiredPermission('tarifas', 'read')
  @Get()
  findAll(@Query() filterDto: TariffCategoryFilterDto) {
    return this.service.getCategorias(
      filterDto.page,
      filterDto.limit,
      filterDto.nombre,
    );
  }

  // OBTENER UNA CATEGORÍA POR ID
  @ApiOperation({ summary: 'Obtener una categoría de tarifa por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría de tarifa',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @RequiredPermission('tarifas', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneCategoria(+id);
  }

  @ApiOperation({ summary: 'Actualizar categoría (crea nueva versión)' })
  @RequiredPermission('tarifas', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaTarifaDto) {
    return this.service.updateCategoria(+id, dto);
  }

  @ApiOperation({ summary: 'Eliminar categoría (soft delete)' })
  @RequiredPermission('tarifas', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteCategoria(+id);
  }
}
