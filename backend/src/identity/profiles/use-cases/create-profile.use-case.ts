import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateProfileDto } from '../dto/create-profile.dto';

@Injectable()
export class CreateProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: number, createProfileDto: CreateProfileDto) {
    const existing = await this.prisma.perfiles.findUnique({
      where: { usuarioId },
    });

    if (existing) {
      throw new ConflictException('El usuario ya tiene un perfil creado');
    }

    return this.prisma.perfiles.create({
      data: {
        usuarioId,
        nombres: createProfileDto.firstName,
        apellidos: createProfileDto.lastName,
        telefono: createProfileDto.phone,
      },
    });
  }
}
