import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Crea un nuevo usuario en el sistema.
   * Requiere permiso: users:create
   */
  @ApiOperation({
    summary: 'Crear usuario',
    description:
      'Crea un nuevo usuario con email y contraseña. El email debe ser único en el sistema.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos del usuario a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        usersId: 1,
        email: 'nuevo@jasrapo.com',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:create' })
  @ApiResponse({ status: 409, description: 'Conflicto - El email ya existe' })
  @RequiredPermission('users', 'create')
  @Post('/')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Obtiene todos los usuarios con paginación opcional.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Retorna una lista paginada de usuarios. Si no se especifican parámetros de paginación, retorna todos los usuarios.',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Número de registros a omitir (para paginación)',
    required: false,
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    description: 'Número máximo de registros a retornar',
    required: false,
    example: 10,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @RequiredPermission('users', 'read')
  @Get('/')
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.userService.users({
      skip: skip ?? undefined,
      take: take ?? undefined,
    });
  }

  /**
   * Obtiene un usuario específico por su ID.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description:
      'Retorna los datos de un usuario específico, incluyendo sus roles y permisos asignados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.user({ usersId: id });
  }

  /**
   * Obtiene los roles asignados a un usuario.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener roles de usuario',
    description:
      'Retorna los roles asignados a un usuario específico, sin incluir información de la relación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Roles del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'read')
  @Get(':id/roles')
  getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getRolesByUserId(id);
  }

  /**
   * Obtiene las asignaciones de rol de un usuario.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener asignaciones de rol de usuario',
    description:
      'Retorna los roles asignados a un usuario con información de la relación (userRolesId), necesario para revocar roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Asignaciones de rol obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'read')
  @Get(':id/role-assignments')
  getUserRoleAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getRoleAssignmentsByUserId(id);
  }

  /**
   * Actualiza los datos de un usuario.
   * Requiere permiso: users:update
   */
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos básicos de un usuario (email o contraseña).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Datos a actualizar (email y/o password)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:update' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'update')
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser({
      where: { usersId: id },
      data: {
        email: updateUserDto.email,
        password: updateUserDto.password,
      },
    });
  }

  /**
   * Asigna un rol a un usuario.
   * Requiere permiso: users:update
   */
  @ApiOperation({
    summary: 'Asignar rol a usuario',
    description:
      'Asigna un rol adicional a un usuario existente. No elimina los roles anteriores.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: AssignRoleDto,
    description: 'ID del rol a asignar',
    examples: {
      ejemplo1: {
        value: { rolesId: 2 },
        summary: 'Asignar rol de Editor',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Rol asignado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:update' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  @RequiredPermission('users', 'update')
  @Post(':id/roles')
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.userService.assignRoleToUser(id, assignRoleDto.rolesId);
  }

  /**
   * Obtiene los permisos directos de un usuario.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener permisos directos del usuario',
    description:
      'Retorna los permisos asignados directamente al usuario, sin incluir los heredados por roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos directos del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'read')
  @Get(':id/permissions')
  getUserPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getDirectPermissionsByUserId(id);
  }

  /**
   * Asigna un permiso directo a un usuario.
   * Requiere permiso: users:update
   */
  @ApiOperation({
    summary: 'Asignar permiso directo a usuario',
    description:
      'Asigna un permiso directo a un usuario sin pasar por un rol. Útil para permisos específicos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: AssignPermissionDto,
    description: 'ID del permiso a asignar y opción allow',
    examples: {
      ejemplo1: {
        value: { permissionsId: 1, allow: true },
        summary: 'Permitir permiso',
      },
      ejemplo2: {
        value: { permissionsId: 1, allow: false },
        summary: 'Revocar permiso',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Permiso asignado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:update' })
  @ApiResponse({ status: 404, description: 'Usuario o permiso no encontrado' })
  @RequiredPermission('users', 'update')
  @Post(':id/permissions')
  assignPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    return this.userService.assignPermissionToUser(
      id,
      assignPermissionDto.permissionsId,
      assignPermissionDto.allow ?? true,
    );
  }

  /**
   * Revoca un rol asignado a un usuario.
   * Requiere permiso: users:delete
   */
  @ApiOperation({
    summary: 'Revocar rol de usuario',
    description:
      'Revoca (soft delete) un rol asignado a un usuario. El userRoleId es el ID de la relación en users_roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiParam({
    name: 'userRoleId',
    description: 'ID de la relación usuario-rol (users_roles)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol revocado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:delete' })
  @ApiResponse({ status: 404, description: 'Relación usuario-rol no encontrada' })
  @RequiredPermission('users', 'delete')
  @Delete(':id/roles/:userRoleId')
  revokeRole(@Param('userRoleId', ParseIntPipe) userRolesId: number) {
    return this.userService.revokeRoleFromUser(userRolesId);
  }

  /**
   * Elimina un usuario (Soft Delete).
   * Requiere permiso: users:delete
   */
  @ApiOperation({
    summary: 'Eliminar usuario',
    description:
      'Marca un usuario como eliminado (soft delete). El usuario no se borra permanentemente de la base de datos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:delete' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.softDeleteUser({ usersId: id });
  }

  /**
   * Revoca un permiso directo de un usuario.
   * Requiere permiso: users:delete
   */
  @ApiOperation({
    summary: 'Revocar permiso directo de usuario',
    description:
      'Revoca (soft delete) un permiso asignado directamente a un usuario. El userPermissionId es el ID de la relación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiParam({
    name: 'userPermissionId',
    description: 'ID de la relación usuario-permiso (users_permissions)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso revocado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:delete' })
  @ApiResponse({ status: 404, description: 'Relación usuario-permiso no encontrada' })
  @RequiredPermission('users', 'delete')
  @Delete(':id/permissions/:userPermissionId')
  revokePermission(
    @Param('userPermissionId', ParseIntPipe) userPermissionId: number,
  ) {
    return this.userService.revokePermissionFromUser(userPermissionId);
  }

  /**
   * Obtiene los permisos efectivos de un usuario.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener permisos efectivos del usuario',
    description:
      'Retorna la lista de permisos efectivos de un usuario, incluyendo permisos directos y heredados por roles.',
  })
  @ApiParam({
    name: 'usersId',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos efectivos obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'read')
  @Get('getEffectivePermissions:id/effective-permissions')
  getEffectivePermissions(@Param('usersId', ParseIntPipe) usersId: number) {
    return this.userService.getEffectivePermissions(usersId);
  }
}

