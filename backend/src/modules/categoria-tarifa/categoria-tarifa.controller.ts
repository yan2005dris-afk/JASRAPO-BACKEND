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
  @ApiOperation({ summary: 'Obtener todas las categorías (activas e inactivas para admin)' })
  @Get()
  async findAll(
    @Query('includeInactive') includeInactive: string, // valor 'true' o 'false' desde frontend
    @AuthUserId() userId: number, // opcional si quieres usar permisos
  ) {
    // Ejemplo: verificar permisos de admin
    const canViewInactive = true; // aquí podrías usar tu PermissionsGuard para chequear

    return this.service.getCategorias({
      includeInactive: includeInactive === 'true',
      canViewInactive,
    });
  }

  // BÚSQUEDA POR NOMBRE → aplica mismo control de permisos y botón
  @ApiOperation({ summary: 'Buscar categoría por nombre (aplica includeInactive para admin)' })
  @Get('buscar')
  async buscar(
    @Query('nombre') nombre: string,
    @Query('includeInactive') includeInactive: string,
    @AuthUserId() userId: number,
  ) {
    const canViewInactive = true; // validar permisos de admin

    return this.service.buscarCategoriaPorNombre({
      nombre,
      includeInactive: includeInactive === 'true',
      canViewInactive,
    });
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
