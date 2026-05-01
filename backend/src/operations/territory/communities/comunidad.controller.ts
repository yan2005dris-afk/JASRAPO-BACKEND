import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComunidadService } from './comunidad.service';
import { CreateComunidadDto } from './dto/create-comunidad.dto';
import { UpdateComunidadDto } from './dto/update-comunidad.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';

@ApiTags('communities')
@ApiBearerAuth()
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
    return this.comunidadService.crearComunidad(createComunidadDto);
  }

  @ApiOperation({
    summary: 'Listar comunidades',
    description: 'Retorna todas las comunidades',
  })
  @ApiResponse({ status: 200, description: 'Lista de comunidades' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('comunidades', 'read')
  @Get()
  findAll() {
    return this.comunidadService.findAll();
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
    return this.comunidadService.actualizarComunidad(+id, updateComunidadDto);
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
  remove(@Param('id') id: string) {
    return this.comunidadService.eliminarActualizar(+id);
  }
}
