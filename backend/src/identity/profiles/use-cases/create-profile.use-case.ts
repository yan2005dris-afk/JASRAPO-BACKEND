import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateProfileDto } from '../dto/create-profile.dto';

@Injectable()
export class CreateProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number, createProfileDto: CreateProfileDto) {
    const existing = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (existing) {
      throw new ConflictException('El usuario ya tiene un perfil creado');
    }

    return this.prisma.profiles.create({
      data: {
        usersId,
        firstName: createProfileDto.firstName,
        lastName: createProfileDto.lastName,
        phone: createProfileDto.phone,
      },
    });
  }
}
