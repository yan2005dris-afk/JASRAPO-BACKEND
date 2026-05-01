import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRolePermissionDto } from './dto/assign-role-permission.dto';
import { SetRoleChildrenDto } from './dto/set-role-children.dto';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('roles')
@ApiBearerAuth()
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
    schema: {
      example: {
        rolesId: 1,
        name: 'Administrador',
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
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
  createRol(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * Obtiene todos los roles del sistema.
   * Requiere permiso: roles:read
   */
  @ApiOperation({
    summary: 'Listar roles',
    description: 'Retorna todos los roles registrados en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:read',
  })
  @RequiredPermission('roles', 'read')
  @Get()
  findAllRoles() {
    return this.rolesService.findAll();
  }

  /**
   * Obtiene un rol específico por su ID.
   * Requiere permiso: roles:read
   */
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Retorna los datos de un rol específico.',
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
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:read',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @RequiredPermission('roles', 'read')
  @Get(':id')
  findOneRol(@Param('id', ParseIntPipe) id: string) {
    return this.rolesService.findOne(+id);
  }

  /**
   * Actualiza los datos de un rol.
   * Requiere permiso: roles:update
   */
  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Actualiza el nombre de un rol existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'Datos a actualizar (nombre del rol)',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
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
  updateRol(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  /**
   * Obtiene los permisos de un rol.
   * Requiere permiso: roles:read
   */
  @ApiOperation({
    summary: 'Obtener permisos efectivos de un rol',
    description:
      'Retorna todos los permisos efectivos de un rol, incluyendo los heredados de roles hijos (jerarquía completa). ' +
      'Los permisos se deduplicado automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos del rol obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:read',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @RequiredPermission('roles', 'read')
  @Get(':id/permissions')
  getRolePermissions(@Param('id', ParseIntPipe) id: string) {
    return this.rolesService.getRolePermissions(+id);
  }

  @ApiOperation({
    summary: 'Obtener roles hijos de un rol',
    description:
      'Lista los roles hijos heredados directamente por el rol padre. ' +
      'Útil para visualizar la jerarquía de herencia de permisos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol padre',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles hijos obtenida exitosamente',
    schema: {
      example: [
        { roleHierarchyId: 1, childRoleId: 5, childRoleName: 'operadores' },
        { roleHierarchyId: 2, childRoleId: 6, childRoleName: 'contabilidad' },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:read',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @RequiredPermission('roles', 'read')
  @Get(':id/children')
  getRoleChildren(@Param('id', ParseIntPipe) id: string) {
    return this.rolesService.getRoleChildren(+id);
  }

  @ApiOperation({
    summary: 'Configurar roles hijos de un rol',
    description:
      'Reemplaza la lista de roles hijos heredados por el rol padre. ' +
      'Los enlaces que ya no estén en la lista se eliminan lógicamente (soft delete) ' +
      'y los nuevos se crean. El rol padre heredará los permisos de todos sus hijos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol padre',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: SetRoleChildrenDto,
    description: 'Lista de IDs de roles hijos a asignar',
    examples: {
      ejemplo1: {
        value: { childRoleIds: [5, 6] },
        summary: 'Asignar operadores y contabilidad como hijos',
      },
      ejemplo2: {
        value: { childRoleIds: [] },
        summary: 'Remover todos los roles hijos',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Roles hijos actualizados exitosamente',
    schema: {
      example: [
        {
          roleHierarchyId: 1,
          childRoleId: 5,
          childRole: { name: 'operadores' },
        },
        {
          roleHierarchyId: 2,
          childRoleId: 6,
          childRole: { name: 'contabilidad' },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:update',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol padre o algún rol hijo no encontrado',
  })
  @RequiredPermission('roles', 'update')
  @Patch(':id/children')
  setRoleChildren(
    @Param('id', ParseIntPipe) id: string,
    @Body() dto: SetRoleChildrenDto,
  ) {
    return this.rolesService.setRoleChildren(+id, dto);
  }

  /**
   * Asigna un permiso a un rol.
   * Requiere permiso: roles:update
   */
  @ApiOperation({
    summary: 'Asignar permiso a rol',
    description: 'Asigna un permiso a un rol existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: AssignRolePermissionDto,
    description: 'ID del permiso a asignar',
    examples: {
      ejemplo1: {
        value: { permissionsId: 1 },
        summary: 'Asignar permiso de lectura',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Permiso asignado exitosamente al rol',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:update',
  })
  @ApiResponse({ status: 404, description: 'Rol o permiso no encontrado' })
  @RequiredPermission('roles', 'update')
  @Post(':id/permissions')
  assignPermission(
    @Param('id', ParseIntPipe) id: string,
    @Body() assignRolePermissionDto: AssignRolePermissionDto,
  ) {
    return this.rolesService.assignPermission(
      +id,
      assignRolePermissionDto.permissionsId,
    );
  }

  /**
   * Revoca un permiso de un rol.
   * Requiere permiso: roles:delete
   */
  @ApiOperation({
    summary: 'Revocar permiso de rol',
    description: 'Revoca (soft delete) un permiso asignado a un rol.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    type: Number,
    example: 1,
  })
  @ApiParam({
    name: 'permissionId',
    description: 'ID del permiso a revocar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso revocado exitosamente del rol',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso roles:delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Relación rol-permiso no encontrada',
  })
  @RequiredPermission('roles', 'delete')
  @Patch(':id/permissions/:permissionId')
  removePermission(
    @Param('id', ParseIntPipe) id: string,
    @Param('permissionId', ParseIntPipe) permissionId: string,
  ) {
    return this.rolesService.removePermission(+id, +permissionId);
  }
}
