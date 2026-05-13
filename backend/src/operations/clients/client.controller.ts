import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { ClientEntity } from './types/client.entity';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';

@ApiTags('clients')
@ApiBearerAuth()
@ApiExtraModels(ClientEntity, PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * Obtener identificaciones
   */
  @ApiOperation({
    summary: 'Catálogo de tipos de identificación',
    description: 'Retorna lista de tipos de identificación para formularios',
  })
  @ApiResponse({ status: 200, description: 'Lista de identificaciones' })
  @RequiredPermission('clientes', 'read')
  @Get('identification-types')
  findAllIdentificaciones() {
    return this.clientService.findAllIdentificaciones();
  }

  /**
   * Crear un nuevo cliente
   */
  @ApiOperation({
    summary: 'Crear cliente',
    description: 'Registra un nuevo cliente en el sistema',
  })
  @ApiBody({ type: CreateClientDto, description: 'Datos del cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:create' })
  @RequiredPermission('clientes', 'create')
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  /**
   * Listar todos los clientes
   * Soporta filtros: identificacion, nombres, apellidos, nombreCompleto
   */
  @ApiOperation({
    summary: 'Listar clientes',
    description: 'Retorna clientes con filtros opcionales y paginación',
  })
  @ApiPaginatedResponse(ClientEntity)
  @RequiredPermission('clientes', 'read')
  @Get()
  findAll(@Query() filters: FilterClientDto) {
    return this.clientService.findAll(filters);
  }

  /**
   * Obtener un cliente por ID
   */
  @ApiOperation({
    summary: 'Obtener cliente',
    description: 'Retorna los datos de un cliente específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cliente',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: ClientEntity })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:read' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @RequiredPermission('clientes', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  /**
   * Actualizar un cliente
   */
  @ApiOperation({
    summary: 'Actualizar cliente',
    description: 'Actualiza los datos de un cliente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cliente',
    type: String,
    example: '1',
  })
  @ApiBody({ type: UpdateClientDto, description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:update' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @RequiredPermission('clientes', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  /**
   * Eliminar un cliente (Soft Delete)
   */
  @ApiOperation({
    summary: 'Eliminar cliente',
    description: 'Marca un cliente como eliminado (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cliente',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:delete' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @RequiredPermission('clientes', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clientService.delete(id);
  }
}
