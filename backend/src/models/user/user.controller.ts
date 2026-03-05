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
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequiredPermission } from 'src/auth/decorators/require-permission.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ 
    summary: 'Crear un nuevo usuario', 
    description: 'Crea un usuario en el sistema. Requiere permiso de creación de usuarios.' 
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 409, description: 'El usuario ya existe' })
  @ApiBody({ type: CreateUserDto })
  @RequiredPermission('users', 'create')
  @Post('/')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiOperation({ 
    summary: 'Obtener todos los usuarios', 
    description: 'Retorna una lista paginada de usuarios. Soporta paginación con skip y take.' 
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiQuery({ name: 'skip', description: 'Número de registros a omitir (para paginación)', required: false, type: Number })
  @ApiQuery({ name: 'take', description: 'Número de registros a retornar (para paginación)', required: false, type: Number })
  @RequiredPermission('users', 'read')
  @Get('/')
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.userService.users({
      skip: skip ?? undefined,
      take: take ?? undefined,
    });
  }

  @ApiOperation({ 
    summary: 'Obtener un usuario por ID', 
    description: 'Retorna los datos de un usuario específico' 
  })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'integer' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.user({ usersId: id });
  }

  @ApiOperation({ 
    summary: 'Actualizar un usuario', 
    description: 'Actualiza los datos de un usuario existente (email y/o contraseña)' 
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar', type: 'integer' })
  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  update(
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

  @ApiOperation({ 
    summary: 'Actualizar el rol de un usuario', 
    description: 'Asigna o cambia el rol de un usuario específico' 
  })
  @ApiResponse({ status: 200, description: 'Rol de usuario actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario o relación no encontrada' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'integer' })
  @ApiBody({ type: UpdateUserRoleDto })
  @Patch(':id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole({
      usersRolesId: updateUserRoleDto.usersRolesId,
      rolesId: updateUserRoleDto.rolesId,
      deletedAt: updateUserRoleDto.deletedAt,
    });
  }

  @ApiOperation({ 
    summary: 'Eliminar un usuario', 
    description: 'Elimina (soft delete) un usuario del sistema' 
  })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar', type: 'integer' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser({ usersId: id });
  }

  @ApiOperation({ 
    summary: 'Obtener permisos efectivos del usuario', 
    description: 'Retorna todos los permisos efectivos de un usuario (directos y heredados por rol)' 
  })
  @ApiResponse({ status: 200, description: 'Permisos obtenidos exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'usersId', description: 'ID del usuario', type: 'integer' })
  @Get('getEffectivePermissions/:usersId')
  getEffectivePermissions(@Param('usersId') usersId: number) {
    return this.userService.getEffectivePermissions(usersId);
  }
}

