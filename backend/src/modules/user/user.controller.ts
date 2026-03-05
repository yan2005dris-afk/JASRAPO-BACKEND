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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Crea un nuevo usuario con los datos proporcionados en el CreateUserDto.
   * @param createUserDto
   * @returns
   */
  @RequiredPermission('users', 'create')
  @Post('/')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Obtiene a todos los usuarios, con paginación opcional a través de query params skip y take.
   * @param skip
   * @param take
   * @returns
   */
  @RequiredPermission('users', 'read')
  @Get('/')
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.userService.users({
      skip: skip ?? undefined,
      take: take ?? undefined,
    });
  }

  /**
   * Obtiene un usuario por su ID, incluyendo sus roles y permisos asignados.
   * @param id
   * @returns
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.user({ usersId: id });
  }

  /**
   * Obtiene los roles asignados a un usuario específico, sin incluir información de la relación (users_roles).
   * @param id
   * @returns
   */
  @RequiredPermission('users', 'read')
  @Get(':id/roles')
  getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getRolesByUserId(id);
  }

  /**
   * Obtiene los roles asignados a un usuario específico, incluyendo información de la relación (users_roles) como el userRolesId, que es necesario para revocar el rol posteriormente.
   * @param id
   * @returns
   */
  @RequiredPermission('users', 'read')
  @Get(':id/role-assignments')
  getUserRoleAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getRoleAssignmentsByUserId(id);
  }

  /**
   * Actualiza los datos básicos de un usuario, como email o contraseña.
   * @param id
   * @param updateUserDto
   * @returns
   */

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
   * Asigna un rol adicional a un usuario existente.
   * No elimina los roles anteriores.
   */
  @RequiredPermission('users', 'update')
  @Post(':id/roles')
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.userService.assignRoleToUser(id, assignRoleDto.rolesId);
  }

  /**
   * Obtiene la lista de permisos asignados directamente a un usuario, sin incluir los permisos heredados a través de roles.
   * @param id
   * @returns
   */
  @RequiredPermission('users', 'read')
  @Get(':id/permissions')
  getUserPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getDirectPermissionsByUserId(id);
  }

  /**
   * Asigna un permiso directo a un usuario, sin pasar por un rol.
   * Esto es útil para casos donde se necesita un permiso específico para un usuario sin crear un rol nuevo.
   * @param id
   * @param assignPermissionDto
   * @returns
   */

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
   * Revoca (soft delete) un rol asignado a un usuario.
   * El :userRoleId es el ID de la relación en users_roles, no el ID del rol.
   */
  @RequiredPermission('users', 'delete')
  @Delete(':id/roles/:userRoleId')
  revokeRole(@Param('userRoleId', ParseIntPipe) userRolesId: number) {
    return this.userService.revokeRoleFromUser(userRolesId);
  }

  /**
   * Revoca (soft delete) un usuario completo, incluyendo sus roles y permisos.
   * @param id
   * @returns
   */
  @RequiredPermission('users', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.softDeleteUser({ usersId: id });
  }

  /**
   * Revoca (soft delete) un permiso asignado directamente a un usuario.
   * El :userPermissionId es el ID de la relación en users_permissions, no el ID del permiso.
   * @param userPermissionId
   * @returns
   */
  @RequiredPermission('users', 'delete')
  @Delete(':id/permissions/:userPermissionId')
  revokePermission(
    @Param('userPermissionId', ParseIntPipe) userPermissionId: number,
  ) {
    return this.userService.revokePermissionFromUser(userPermissionId);
  }

  /**
   * Obtiene la lista de permisos efectivos de un usuario, incluyendo los permisos directos y los heredados a través de roles.
   * @param usersId
   * @returns
   */
  @RequiredPermission('users', 'read')
  @Get('getEffectivePermissions:id/effective-permissions')
  getEffectivePermissions(@Param('usersId', ParseIntPipe) usersId: number) {
    return this.userService.getEffectivePermissions(usersId);
  }
}
