import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SectorService } from '../../application/sector.service';
import { CreateSectorDto } from '../dto/create-sector.dto';
import { UpdateSectorDto } from '../dto/update-sector.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';

@ApiTags('sectors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sectors')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @ApiOperation({
    summary: 'Crear sector',
    description: 'Crea un nuevo sector territorial',
  })
  @ApiBody({ type: CreateSectorDto, description: 'Datos del sector' })
  @ApiResponse({ status: 201, description: 'Sector creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso sectores:create' })
  @RequiredPermission('sectores', 'create')
  @Post()
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorService.crearSector(createSectorDto);
  }

  @ApiOperation({
    summary: 'Listar sectores',
    description: 'Retorna todos los sectores',
  })
  @ApiResponse({ status: 200, description: 'Lista de sectores' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('sectores', 'read')
  @Get()
  findAll() {
    return this.sectorService.findAll();
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
  @ApiResponse({ status: 200, description: 'Sector encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @RequiredPermission('sectores', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectorService.findOne(+id);
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
  @ApiResponse({ status: 200, description: 'Sector actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso sectores:update' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @RequiredPermission('sectores', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorService.actualizarSector(+id, updateSectorDto);
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
  @ApiResponse({ status: 200, description: 'Sector eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso sectores:delete' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @RequiredPermission('sectores', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectorService.eliminarSector(+id);
  }
}
