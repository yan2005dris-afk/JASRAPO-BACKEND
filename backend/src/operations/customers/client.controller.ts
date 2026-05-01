import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * Búsqueda de clientes (Pública y Privada unificada)
   */
  @ApiOperation({
    summary: 'Buscar clientes',
    description:
      'Busca clientes por tipo de identificación. Retorna resultados paginados.',
  })
  @ApiQuery({
    name: 'tipo',
    description: 'Tipo de búsqueda: identificacion, nombres, apellidos, nombreCompleto',
    enum: ['identificacion', 'nombres', 'apellidos', 'nombreCompleto'],
    required: true,
    example: 'identificacion',
  })
  @ApiQuery({
    name: 'valor',
    description: 'Texto a buscar',
    required: true,
    example: '12345678',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página (default 1)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Resultados por página (default 10)',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda',
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @Get('search')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  search(
    @Query('tipo')
    tipo: 'identificacion' | 'nombres' | 'apellidos' | 'nombreCompleto',
    @Query('valor') valor: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.clientService.search(tipo, valor, pageNumber, limitNumber);
  }

  /**
   * Crear un nuevo cliente
   */
  @ApiOperation({ summary: 'Crear cliente', description: 'Registra un nuevo cliente en el sistema' })
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
   */
  @ApiOperation({ summary: 'Listar clientes', description: 'Retorna todos los clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:read' })
  @RequiredPermission('clientes', 'read')
  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  /**
   * Obtener un cliente por ID
   */
  @ApiOperation({ summary: 'Obtener cliente', description: 'Retorna los datos de un cliente específico' })
  @ApiParam({ name: 'id', description: 'ID único del cliente', type: String, example: '1' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
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
  @ApiOperation({ summary: 'Actualizar cliente', description: 'Actualiza los datos de un cliente' })
  @ApiParam({ name: 'id', description: 'ID único del cliente', type: String, example: '1' })
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
  @ApiOperation({ summary: 'Eliminar cliente', description: 'Marca un cliente como eliminado (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID único del cliente', type: String, example: '1' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:delete' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @RequiredPermission('clientes', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
