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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../../application/user.service';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { AuthUserId } from 'src/infrastructure/common/decorators/auth-user-id.decorator';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  UserEntity,
  UserProfileEntity,
  RoleEntity,
  AuthPermissionEntity,
  DirectPermissionEntity,
  UserDetailEntity,
  AvatarEntity,
} from '../../domain/entities/user.entity';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';

@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(
  UserEntity,
  UserProfileEntity,
  RoleEntity,
  AuthPermissionEntity,
  DirectPermissionEntity,
  UserDetailEntity,
  AvatarEntity,
)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retorna los datos del perfil del usuario autenticado.
   */
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description:
      'Retorna los datos del usuario actualmente autenticado (email, nombres, apellidos, teléfono, avatar y rol).',
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
    const res = await this.userService.findMe(usersId);
    return new UserProfileEntity(res);
  }

  /**
   * Actualiza el perfil del usuario autenticado (incluyendo avatar opcional).
   */
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description:
      'Actualiza los datos del usuario autenticado (nombres, email, teléfono, avatar).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserDetailEntity,
  })
  @RequiredPermission('users', 'update')
  @Patch('me')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/i)) {
          return callback(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateMe(
    @AuthUserId() userId: number,
    @Body() updateDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserDetailEntity> {
    // Un usuario no debería poder cambiarse su propio rol o permisos directos por seguridad
    const {
      rolId: _rolId,
      directPermissions: _directPermissions,
      ...selfData
    } = updateDto;

    const result = await this.userService.updateUser(userId, selfData, file);
    if (!result) throw new NotFoundException('Usuario no encontrado');
    return new UserDetailEntity(result);
  }

  /**
   * Crea un nuevo usuario con avatar opcional.
   * Requiere permiso: users:create
   */
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @RequiredPermission('users', 'create')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/i)) {
          return callback(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserEntity> {
    if (typeof createUserDto.rolId === 'string') {
      const parsed = parseInt(createUserDto.rolId, 10);
      if (isNaN(parsed)) {
        throw new BadRequestException('rolId debe ser un número válido');
      }
      createUserDto.rolId = parsed;
    }
    const created = await this.userService.createUser(createUserDto, file);
    return new UserEntity(created);
  }

  /**
   * Lista todos los usuarios con soporte para paginación.
   * Requiere permiso: users:read
   */
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiPaginatedResponse(UserEntity)
  @RequiredPermission('users', 'read')
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserEntity>> {
    const res = await this.userService.users(paginationDto);
    return {
      ...res,
      data: res.data.map((u) => new UserEntity(u)),
    };
  }

  /**
   * Obtiene un usuario por su ID.
   * Requiere permiso: users:read
   */
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UserDetailEntity,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserDetailEntity> {
    const user = await this.userService.user({ usuarioId: id });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return new UserDetailEntity(user);
  }

  /**
   * Actualiza los datos de un usuario por su ID, incluyendo avatar opcional.
   * Permite actualizar email, nombres, apellidos, teléfono, rol y permisos directos.
   * Requiere permiso: users:update
   */
  @ApiOperation({
    summary: 'Actualizar usuario',
    description:
      'Actualiza de forma flexible cualquier campo del usuario: email, nombres, apellidos, teléfono, rol (rolId) y permisos directos. También permite subir un avatar.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserDetailEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso users:update',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya está en uso',
  })
  @RequiredPermission('users', 'update')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/i)) {
          return callback(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserDetailEntity> {
    if (typeof updateUserDto.rolId === 'string') {
      const parsed = parseInt(updateUserDto.rolId, 10);
      if (isNaN(parsed)) {
        throw new BadRequestException('rolId debe ser un número válido');
      }
      updateUserDto.rolId = parsed;
    }
    if (typeof updateUserDto.directPermissions === 'string') {
      try {
        updateUserDto.directPermissions = JSON.parse(
          updateUserDto.directPermissions,
        );
      } catch {
        throw new BadRequestException(
          'directPermissions debe ser un JSON válido',
        );
      }
    }

    const result = await this.userService.updateUser(id, updateUserDto, file);
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return new UserDetailEntity(result);
  }

  /**
   * Elimina un usuario (Soft Delete).
   * Requiere permiso: users:delete
   */
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Marca un usuario como eliminado (soft delete).',
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
    return this.userService.softDeleteUser(id);
  }
}
