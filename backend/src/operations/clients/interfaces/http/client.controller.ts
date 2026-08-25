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
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
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
import { ClientService } from '../../application/client.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { FilterClientDto } from '../dto/filter-client.dto';
import {
  ClientResponseDto,
  TipoIdentificacionResponseDto,
} from '../dto/client-response.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@ApiTags('clients')
@ApiBearerAuth()
@ApiExtraModels(
  ClientResponseDto,
  TipoIdentificacionResponseDto,
  PaginationMetaDto,
)
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
  @ApiResponse({
    status: 200,
    description: 'Lista de identificaciones',
    type: [TipoIdentificacionResponseDto],
  })
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
  @ApiResponse({
    status: 201,
    description: 'Cliente creado',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:create' })
  @RequiredPermission('clientes', 'create')
  @Post()
  async create(
    @Body() createClientDto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    return ClientResponseDto.fromEntity(
      await this.clientService.create(createClientDto),
    );
  }

  /**
   * Listar todos los clientes
   * Soporta filtros: identificacion, nombres, apellidos, nombreCompleto
   */
  @ApiOperation({
    summary: 'Listar clientes',
    description: 'Retorna clientes con filtros opcionales y paginación',
  })
  @ApiPaginatedResponse(ClientResponseDto)
  @RequiredPermission('clientes', 'read')
  @Get()
  async findAll(
    @Query() filters: FilterClientDto,
  ): Promise<PaginatedResult<ClientResponseDto>> {
    const result = await this.clientService.findAll(filters);
    return {
      data: result.data.map((x) => ClientResponseDto.fromEntity(x)),
      meta: result.meta,
    };
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
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:read' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @RequiredPermission('clientes', 'read')
  @Get(':id')
  findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ClientResponseDto> {
    return this.clientService
      .findOne(id)
      .then((entity) => ClientResponseDto.fromEntity(entity));
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
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateClientDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:update' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @RequiredPermission('clientes', 'update')
  @Patch(':id')
  update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientService
      .update(id, updateClientDto)
      .then((entity) => ClientResponseDto.fromEntity(entity));
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
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso clientes:delete' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @RequiredPermission('clientes', 'delete')
  @Delete(':id')
  delete(@Param('id', ParseBigIntPipe) id: bigint): Promise<ClientResponseDto> {
    return this.clientService
      .delete(id)
      .then((entity) => ClientResponseDto.fromEntity(entity));
  }
}
