import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea el perfil del usuario autenticado.
   * Lanza ConflictException si ya existe un perfil para ese usuario.
   */
  async create(usersId: number, createProfileDto: CreateProfileDto) {
    const existing = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (existing) {
      throw new ConflictException('El usuario ya tiene un perfil creado');
    }

    const profile = await this.prisma.profiles.create({
      data: {
        usersId,
        firstName: createProfileDto.firstName,
        lastName: createProfileDto.lastName,
        phone: createProfileDto.phone,
        avatar: createProfileDto.avatar,
      },
    });

    return profile;
  }

  /**
   * Retorna el perfil del usuario autenticado.
   * Lanza NotFoundException si no existe.
   */
  async findMyProfile(usersId: number) {
    const profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!profile) {
      throw new NotFoundException('El usuario aún no tiene un perfil');
    }

    return profile;
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Lanza NotFoundException si el perfil no existe.
   */
  async update(usersId: number, updateProfileDto: UpdateProfileDto) {
    const existing = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!existing) {
      throw new NotFoundException(
        'No se encontró un perfil para este usuario. Crea uno primero.',
      );
    }

    const updated = await this.prisma.profiles.update({
      where: { usersId },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
        avatar: updateProfileDto.avatar,
      },
    });

    return updated;
  }
}
