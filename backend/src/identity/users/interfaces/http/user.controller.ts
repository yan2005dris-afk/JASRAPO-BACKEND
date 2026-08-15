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
import {
  UserProfileResponseDto,
  UserResponseDto,
  UserDetailResponseDto,
} from '../dto/user-response.dto';
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
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const AVATAR_UPLOAD_OPTIONS = {
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
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
};

@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(UserResponseDto, UserDetailResponseDto, UserProfileResponseDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Obtiene el perfil del usuario autenticado.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description:
      'Retorna la información del perfil del usuario que realiza la petición.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('users', 'read')
  @Get('me')
  async findMe(@AuthUserId() usersId: number): Promise<UserProfileResponseDto> {
    const user = await this.userService.findMe(usersId);
    return UserProfileResponseDto.fromEntity(user);
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
    type: UserDetailResponseDto,
  })
  @RequiredPermission('users', 'update')
  @Patch('me')
  @UseInterceptors(FileInterceptor('file', AVATAR_UPLOAD_OPTIONS))
  async updateMe(
    @AuthUserId() userId: number,
    @Body() updateDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserDetailResponseDto> {
    const {
      rolId: _rolId,
      directPermissions: _directPermissions,
      ...selfData
    } = updateDto;

    const result = await this.userService.updateUser(userId, selfData, file);
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return UserDetailResponseDto.fromEntity(result);
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
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada no válidos' })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya está en uso',
  })
  @RequiredPermission('users', 'create')
  @Post()
  @UseInterceptors(FileInterceptor('file', AVATAR_UPLOAD_OPTIONS))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto, file);
    return UserResponseDto.fromEntity(user);
  }

  /**
   * Lista todos los usuarios con soporte para paginación.
   * Requiere permiso: users:read
   */
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiPaginatedResponse(UserResponseDto)
  @RequiredPermission('users', 'read')
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.userService.users(paginationDto);
    return {
      data: result.data.map((user) => UserResponseDto.fromEntity(user)),
      meta: result.meta,
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
    type: UserDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserDetailResponseDto> {
    const user = await this.userService.user({ usuarioId: id });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return UserDetailResponseDto.fromEntity(user);
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
    type: UserDetailResponseDto,
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
  @UseInterceptors(FileInterceptor('file', AVATAR_UPLOAD_OPTIONS))
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserDetailResponseDto> {
    const result = await this.userService.updateUser(id, updateUserDto, file);
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return UserDetailResponseDto.fromEntity(result);
  }

  /**
   * Elimina un usuario (Soft Delete).
   * Requiere permiso: users:delete
   */
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.softDeleteUser(id);
    return { message: 'Usuario eliminado exitosamente' };
  }
}
