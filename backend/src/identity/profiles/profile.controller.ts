import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';
import { MinioService } from '../../infrastructure/storage/minio.service';
import { Public } from 'src/infrastructure/common/decorators/public.decorator';
import type { Response } from 'express';
import { AuthUserId } from 'src/infrastructure/common/decorators/auth-user-id.decorator';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly minioService: MinioService,
  ) {}

  /**
   * Crea el perfil del usuario autenticado.
   * Solo se puede crear una vez; retorna 409 si ya existe.
   */
  @ApiOperation({
    summary: 'Crear perfil del usuario autenticado',
    description:
      'Crea el perfil para el usuario actualmente autenticado. Solo se permite crear un perfil por usuario.',
  })
  @ApiBody({
    type: CreateProfileDto,
    description: 'Datos del perfil a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Perfil creado exitosamente',
    schema: {
      example: {
        profileId: 1,
        usersId: 1,
        name: 'Juan Pérez',
        phone: '+593999999999',
        address: 'Quito, Ecuador',
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto - El usuario ya tiene un perfil creado',
  })
  @RequiredPermission('profile', 'create')
  @Post()
  createProfile(
    @AuthUserId() usersId: number,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profileService.create(usersId, createProfileDto);
  }

  /**
   * Retorna el perfil del usuario autenticado.
   */
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description: 'Retorna el perfil del usuario actualmente autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    schema: {
      example: {
        profileId: 1,
        usersId: 1,
        name: 'Juan Pérez',
        phone: '+593999999999',
        address: 'Quito, Ecuador',
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @RequiredPermission('profile', 'read')
  @Get('me')
  findMeProfile(@AuthUserId() usersId: number) {
    return this.profileService.findMyProfile(usersId);
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Retorna 404 si el perfil no existe aún.
   */
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description:
      'Actualiza los datos del perfil del usuario actualmente autenticado.',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Datos a actualizar en el perfil',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    schema: {
      example: {
        profileId: 1,
        usersId: 1,
        name: 'Juan Pérez Actualizado',
        phone: '+593988888888',
        address: 'Guayaquil, Ecuador',
        updatedAt: '2024-01-15T12:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @RequiredPermission('profile', 'update')
  @Patch('me')
  updateProfile(
    @AuthUserId() usersId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.update(usersId, updateProfileDto);
  }

  /**
   * Sube una foto de perfil (avatar) a MinIO y guarda la referencia en la base de datos para el perfil del usuario autenticado.
   */
  @ApiOperation({
    summary: 'Subir foto de perfil',
    description:
      'Sube una imagen a MinIO y actualiza el campo de avatar del perfil del usuario.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Foto de perfil subida exitosamente',
  })
  @ApiResponse({ status: 400, description: 'No se envió ninguna imagen' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @RequiredPermission('profile', 'update')
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @AuthUserId() usersId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.uploadAvatar(usersId, file);
  }

  /**
   * Lista los avatares disponibles en MinIO para el usuario autenticado.
   * Permite reutilizar imágenes previamente subidas sin tener que volver a subirlas.
   */
  @ApiOperation({
    summary: 'Listar avatares disponibles',
    description:
      'Lista las imágenes de avatar disponibles en MinIO para el usuario. ' +
      'Útil para recuperar y reutilizar imágenes previamente subidas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de avatares disponibles',
    schema: {
      example: {
        avatars: [
          { key: 'avatar_profile_1_1709834567890.png', url: 'http://...' },
        ],
      },
    },
  })

  /**
   * Lista los avatares disponibles en MinIO para el usuario autenticado.
   */
  @ApiOperation({
    summary: 'Seleccionar avatar existente',
    description:
      'Permite seleccionar una imagen que ya existe en MinIO como avatar del usuario. ' +
      'No es necesario volver a subir el archivo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['key'],
      properties: {
        key: {
          type: 'string',
          description: 'Nombre del archivo en MinIO',
          example: 'avatar_profile_1_1709834567890.png',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar vinculado exitosamente' })
  @ApiResponse({ status: 404, description: 'El archivo no existe en MinIO' })
  @RequiredPermission('profile', 'read')
  @Get('avatars/available')
  async listAvailableAvatars(@AuthUserId() usersId: number) {
    return this.profileService.listAvailableAvatars(usersId);
  }

  /**
   * Vincula un avatar existente en MinIO al perfil del usuario sin necesidad de re-subir.
   */
  @ApiOperation({
    summary: 'Seleccionar avatar existente',
    description:
      'Permite seleccionar una imagen que ya existe en MinIO como avatar del usuario. ' +
      'No es necesario volver a subir el archivo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['key'],
      properties: {
        key: {
          type: 'string',
          description: 'Nombre del archivo en MinIO',
          example: 'avatar_profile_1_1709834567890.png',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar vinculado exitosamente' })
  @ApiResponse({ status: 404, description: 'El archivo no existe en MinIO' })
  @RequiredPermission('profile', 'update')
  @Patch('avatar/select')
  async selectExistingAvatar(
    @AuthUserId() usersId: number,
    @Body('key') key: string,
  ) {
    return this.profileService.selectExistingAvatar(usersId, key);
  }

  /**
   * Redirige a la URL presigned de MinIO para servir el avatar.
   * Este endpoint es público (no requiere JWT) para que pueda usarse en <img src="...">.
   */
  @ApiOperation({
    summary: 'Obtener imagen de avatar',
    description:
      'Redirige a una URL temporal de MinIO para servir la imagen del avatar. ' +
      'No requiere autenticación, ya que se usa directamente en etiquetas <img>.',
  })
  @ApiParam({
    name: 'fileName',
    description: 'Nombre del archivo de avatar almacenado en MinIO',
    example: 'avatar_profile_1_1709834567890.png',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirige a la URL temporal del avatar',
  })
  @ApiResponse({ status: 404, description: 'Avatar no encontrado' })
  @Public()
  @Get('avatar/:fileName')
  async getAvatar(@Param('fileName') fileName: string, @Res() res: Response) {
    const exists = await this.minioService.fileExists('avatars', fileName);
    if (!exists) {
      return res.status(404).json({
        statusCode: 404,
        message:
          'La imagen ha sido removida o cambiada de lugar por eso no la encuentra',
      });
    }

    try {
      const meta = await this.minioService.getFileMetadata('avatars', fileName);
      const stream = await this.minioService.getFileStream('avatars', fileName);

      res.setHeader('Content-Type', meta?.contentType || 'image/png');
      stream.pipe(res);
    } catch {
      return res.status(500).json({
        statusCode: 500,
        message: 'Error al recuperar la imagen del servidor de almacenamiento',
      });
    }
  }
}
