import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { CreateCategoriaTarifaDto } from './dto/create-categoria-tarifa.dto';
import { UpdateCategoriaTarifaDto } from './dto/update-categoria-tarifa.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUserId } from 'src/common/decorators/auth-user-id.decorator';

@Controller('categoria-tarifa')
export class CategoriaTarifaController {
  constructor(private readonly service: CategoriaTarifaService) {}

  @ApiOperation({ summary: 'Crear categoría tarifa' })
  @ApiResponse({ status: 201, description: 'Creada correctamente' })
  @Post()
  create(@Body() dto: CreateCategoriaTarifaDto) {
    return this.service.createCategoria(dto);
  }

  // LISTADO PRINCIPAL → incluye logica de permisos
  @ApiOperation({ summary: 'Obtener todas las categorías activas' })
  @Get()
  findAll(@Query('nombre') nombre?: string) {
    return this.service.getCategorias(nombre);
  }

  // BÚSQUEDA POR NOMBRE → aplica mismo control de permisos y botón
  @ApiOperation({ summary: 'Buscar categoría por nombre (solo activos)' })
  @Get('buscar')
  buscar(@Query('nombre') nombre: string) {
    return this.service.buscarCategoriaPorNombre(nombre);
  }

  @ApiOperation({ summary: 'Actualizar categoría (crea nueva versión)' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaTarifaDto) {
    return this.service.updateCategoria(+id, dto);
  }

  @ApiOperation({ summary: 'Eliminar categoría (soft delete)' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteCategoria(+id);
  }
}
