import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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
  @Post()
  create(@Req() req: any, @Body() createProfileDto: CreateProfileDto) {
    const usersId: number = req.user.usersId;
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
  @Get('me')
  findMe(@Req() req: any) {
    const usersId: number = req.user.usersId;
    return this.profileService.findMyProfile(usersId);
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Retorna 404 si el perfil no existe aún.
   */
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description: 'Actualiza los datos del perfil del usuario actualmente autenticado.',
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
  @Patch()
  update(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const usersId: number = req.user.usersId;
    return this.profileService.update(usersId, updateProfileDto);
  }
}

