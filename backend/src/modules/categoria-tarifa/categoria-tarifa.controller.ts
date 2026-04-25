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
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { CreateCategoriaTarifaDto } from './dto/create-categoria-tarifa.dto';
import { UpdateCategoriaTarifaDto } from './dto/update-categoria-tarifa.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';

@ApiTags('categoria-tarifa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categoria-tarifa')
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
  @ApiOperation({ summary: 'Obtener todas las categorías activas' })
  @RequiredPermission('tarifas', 'read')
  @Get()
  findAll(@Query('nombre') esto es intencional nombre?: string) {
    return this.service.getCategorias(nombre);
  }

  // BÚSQUEDA POR NOMBRE
  @ApiOperation({ summary: 'Buscar categoría por nombre (solo activos)' })
  @RequiredPermission('tarifas', 'read')
  @Get('buscar')
  buscar(@Query('nombre') nombre: string) {
    return this.service.buscarCategoriaPorNombre(nombre);
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
