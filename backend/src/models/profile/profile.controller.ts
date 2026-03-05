import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @ApiOperation({ 
    summary: 'Crear perfil del usuario autenticado', 
    description: 'Crea el perfil del usuario actualmente autenticado. Solo se puede crear una vez; retorna 409 si ya existe.'
  })
  @ApiResponse({ status: 201, description: 'Perfil creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 409, description: 'Conflicto - El perfil ya existe' })
  @ApiBody({ type: CreateProfileDto })
  @Post()
  create(@Req() req: any, @Body() createProfileDto: CreateProfileDto) {
    const usersId: number = req.user.usersId;
    return this.profileService.create(usersId, createProfileDto);
  }

  @ApiOperation({ 
    summary: 'Obtener mi perfil', 
    description: 'Retorna el perfil del usuario actualmente autenticado.'
  })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @Get('me')
  findMe(@Req() req: any) {
    const usersId: number = req.user.usersId;
    return this.profileService.findMyProfile(usersId);
  }

  @ApiOperation({ 
    summary: 'Actualizar mi perfil', 
    description: 'Actualiza el perfil del usuario actualmente autenticado. Retorna 404 si el perfil no existe aún.'
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiBody({ type: UpdateProfileDto })
  @Patch()
  update(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const usersId: number = req.user.usersId;
    return this.profileService.update(usersId, updateProfileDto);
  }
}

