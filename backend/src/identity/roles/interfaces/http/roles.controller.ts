import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from '../../application/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import {
  RoleResponseDto,
  RoleDetailResponseDto,
} from '../dto/role-response.dto';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
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

@ApiTags('roles')
@ApiBearerAuth()
@ApiExtraModels(RoleResponseDto, RoleDetailResponseDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Crea un nuevo rol en el sistema.
   * Requiere permiso: roles:create
   */
  @ApiOperation({
    summary: 'Crear rol',
    description: 'Crea un nuevo rol en el sistema.',
  })
  @ApiBody({
    type: CreateRoleDto,
    description: 'Datos del rol a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:create',
  })
  @ApiResponse({ status: 409, description: 'Conflicto - El rol ya existe' })
  @RequiredPermission('roles', 'create')
  @Post()
  async createRol(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesService.create(createRoleDto);
    return RoleResponseDto.fromEntity(role);
  }

  /**
   * Obtiene todos los roles del sistema.
   * Requiere permiso: roles:read
   */
  @ApiOperation({
    summary: 'Listar roles',
    description:
      'Retorna todos los roles registrados en el sistema con paginación.',
  })
  @ApiPaginatedResponse(RoleResponseDto)
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:read',
  })
  @RequiredPermission('roles', 'read')
  @Get()
  async findAllRoles(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<RoleResponseDto>> {
    const result = await this.rolesService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
    return {
      data: result.data.map((role) => RoleResponseDto.fromEntity(role)),
      meta: result.meta,
    };
  }

  /**
   * Obtiene un rol específico por su ID, incluyendo sus permisos asociados.
   * Requiere permiso: roles:read
   */
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description:
      'Retorna los datos de un rol específico junto con sus permisos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado exitosamente',
    type: RoleDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:read',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @RequiredPermission('roles', 'read')
  @Get(':id')
  async findOneRol(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RoleDetailResponseDto> {
    const role = await this.rolesService.findOne(id);
    return RoleDetailResponseDto.fromEntity(role);
  }

  /**
   * Actualiza un rol: nombre, asignar y/o revocar permisos.
   * Requiere permiso: roles:update
   */
  @ApiOperation({
    summary: 'Actualizar rol',
    description:
      'Actualiza el nombre de un rol y/o asigna y revoca permisos en una sola operación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateRoleDto,
    description:
      'Datos a actualizar: nombre, permisosAsignar (array de IDs), permisosRevocar (array de IDs)',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    type: RoleDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:update',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @RequiredPermission('roles', 'update')
  @Patch(':id')
  async updateRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDetailResponseDto> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return RoleDetailResponseDto.fromEntity(role);
  }
}
