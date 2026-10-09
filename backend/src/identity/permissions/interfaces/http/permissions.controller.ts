import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PermissionsService } from '../../application/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@ApiTags('permissions')
@ApiBearerAuth()
@ApiExtraModels(PermissionResponseDto)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Crea un nuevo permiso en el sistema.
   * Requiere permiso: permissions:create
   */
  @ApiOperation({
    summary: 'Crear permiso',
    description:
      'Crea un nuevo permiso en el sistema (ej: recurso: users, accion: read).',
  })
  @ApiBody({
    type: CreatePermissionDto,
    description: 'Datos del permiso a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Permiso creado exitosamente',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso permissions:create',
  })
  @ApiResponse({ status: 409, description: 'Conflicto - El permiso ya existe' })
  @RequiredPermission('permissions', 'create')
  @Post()
  async createPermissions(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission =
      await this.permissionsService.create(createPermissionDto);
    return PermissionResponseDto.fromRow(permission);
  }

  /**
   * Obtiene todos los permisos del sistema.
   * Requiere permiso: permissions:read
   */
  @ApiOperation({
    summary: 'Listar permisos',
    description: 'Retorna todos los permisos registrados en el sistema.',
  })
  @ApiPaginatedResponse(PermissionResponseDto)
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso permissions:read',
  })
  @RequiredPermission('permissions', 'read')
  @Get()
  async findAllPermissions(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PermissionResponseDto>> {
    const result = await this.permissionsService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
    return {
      data: result.data.map((permission) =>
        PermissionResponseDto.fromRow(permission),
      ),
      meta: result.meta,
    };
  }

  /**
   * Obtiene un permiso específico por su ID.
   * Requiere permiso: permissions:read
   */
  @ApiOperation({
    summary: 'Obtener permiso por ID',
    description: 'Retorna los datos de un permiso específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del permiso',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso encontrado exitosamente',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso permissions:read',
  })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @RequiredPermission('permissions', 'read')
  @Get(':id')
  async findOnePermissions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.findOne(id);
    return PermissionResponseDto.fromRow(permission);
  }

  /**
   * Actualiza los datos de un permiso.
   * Requiere permiso: permissions:update
   */
  @ApiOperation({
    summary: 'Actualizar permiso',
    description: 'Actualiza el recurso o acción de un permiso existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del permiso a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdatePermissionDto,
    description: 'Datos a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso actualizado exitosamente',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso permissions:update',
  })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @RequiredPermission('permissions', 'update')
  @Patch(':id')
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.update(
      id,
      updatePermissionDto,
    );
    return PermissionResponseDto.fromRow(permission);
  }

  /**
   * Elimina un permiso (Soft Delete).
   * Requiere permiso: permissions:delete
   */
  @ApiOperation({
    summary: 'Eliminar permiso',
    description: 'Marca un permiso como eliminado (soft delete).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del permiso a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso permissions:delete',
  })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @RequiredPermission('permissions', 'delete')
  @Delete(':id')
  async softDeletePermissions(@Param('id', ParseIntPipe) id: number) {
    await this.permissionsService.remove(id);
    return { message: 'Permiso eliminado exitosamente' };
  }
}
