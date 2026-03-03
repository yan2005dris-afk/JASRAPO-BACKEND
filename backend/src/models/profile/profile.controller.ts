import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  /**
   * Crea el perfil del usuario autenticado.
   * Solo se puede crear una vez; retorna 409 si ya existe.
   */
  @ApiOperation({ summary: 'Crear perfil del usuario autenticado' })
  @Post()
  create(@Req() req: any, @Body() createProfileDto: CreateProfileDto) {
    const usersId: number = req.user.usersId;
    return this.profileService.create(usersId, createProfileDto);
  }

  /**
   * Retorna el perfil del usuario autenticado.
   */
  @ApiOperation({ summary: 'Obtener mi perfil' })
  @Get('me')
  findMe(@Req() req: any) {
    const usersId: number = req.user.usersId;
    return this.profileService.findMyProfile(usersId);
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Retorna 404 si el perfil no existe aún.
   */
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  @Patch()
  update(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const usersId: number = req.user.usersId;
    return this.profileService.update(usersId, updateProfileDto);
  }
}
