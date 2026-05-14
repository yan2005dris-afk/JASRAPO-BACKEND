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
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { AuthUserId } from 'src/infrastructure/common/decorators/auth-user-id.decorator';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { UserEntity, UserProfileEntity, RoleEntity, AuthPermissionEntity, DirectPermissionEntity, UserDetailEntity } from './entities/user.entity';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(UserEntity, UserProfileEntity, RoleEntity, AuthPermissionEntity, DirectPermissionEntity, UserDetailEntity)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retorna los datos del perfil del usuario autenticado.
   */
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description: 'Retorna los datos del usuario actualmente autenticado (email, nombres, apellidos, teléfono, avatar y rol).',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    type: UserProfileEntity,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('users', 'read')
  @Get('me')
  async findMe(@AuthUserId() usersId: number): Promise<UserProfileEntity> {
    return this.userService.findMe(usersId);
  }

  /**
   * Crea un nuevo usuario.
   * Requiere permiso: users:create
   */
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserEntity })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @RequiredPermission('users', 'create')
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Lista todos los usuarios con soporte para paginación.
   * Requiere permiso: users:read
   */
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiPaginatedResponse(UserEntity)
  @RequiredPermission('users', 'read')
  @Get()
  findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<UserEntity>> {
    return this.userService.users(paginationDto);
  }

  /**
   * Obtiene un usuario por su ID.
   * Requiere permiso: users:read
   */
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserDetailEntity })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDetailEntity> {
    const user = await this.userService.user({ usuarioId: id });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user as UserDetailEntity;
  }

  /**
   * Actualiza los datos de un usuario por su ID.
   * Permite actualizar email, contraseña, nombres, apellidos, teléfono, avatar (JSON), rol y permisos directos.
   * Requiere permiso: users:update
   */
  @ApiOperation({
    summary: 'Actualizar usuario',
    description:
      'Actualiza de forma flexible cualquier campo del usuario: email, clave, nombres, apellidos, teléfono, avatar (JSON), rol (rolId) y permisos directos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso users:update',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'update')
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUser({
      where: { usuarioId: id },
      data: updateUserDto,
    }) as Promise<UserEntity>;
  }

  /**
   * Elimina un usuario (Soft Delete).
   * Requiere permiso: users:delete
   */
  @ApiOperation({
    summary: 'Eliminar usuario',
    description:
      'Marca un usuario como eliminado (soft delete).',
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
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso users:delete',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.softDeleteUser({ usuarioId: id });
  }
}
