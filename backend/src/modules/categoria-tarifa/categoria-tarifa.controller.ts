import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { CreateCategoriaTarifaDto } from './dto/create-categoria-tarifa.dto';
import { UpdateCategoriaTarifaDto } from './dto/update-categoria-tarifa.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('categoria-tarifa')
export class CategoriaTarifaController {
  constructor(private readonly service: CategoriaTarifaService) {}

  @ApiOperation({ summary: 'Crear categoría tarifa' })
  @ApiResponse({ status: 201, description: 'Creada correctamente' })
  @Post()
  create(@Body() dto: CreateCategoriaTarifaDto) {
    return this.service.create(dto);
  }

  @ApiOperation({
    summary: 'Obtener todas las categorías (activas e inactivas)',
  })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({
    summary: 'Buscar categoría activa por nombre',
  })
  @Get('nombre')
  findOneByNombre(@Query('nombre') nombre: string) {
    return this.service.findOneByNombre(nombre);
  }

  @ApiOperation({
    summary: 'Buscar categoría por nombre (activa o inactiva)',
  })
  @Get('nombre-all')
  findOneByNombreAll(@Query('nombre') nombre: string) {
    return this.service.findOneByNombreAll(nombre);
  }

  @ApiOperation({
    summary: 'Actualizar categoría (crea nueva versión)',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoriaTarifaDto,
  ) {
    return this.service.update(+id, dto);
  }

  @ApiOperation({
    summary: 'Eliminar categoría (soft delete)',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
