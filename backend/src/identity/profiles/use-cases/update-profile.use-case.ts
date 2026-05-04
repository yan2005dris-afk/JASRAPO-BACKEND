import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: number, updateProfileDto: UpdateProfileDto) {
    const existing = await this.prisma.perfiles.findUnique({
      where: { usuarioId },
    });

    if (!existing) {
      return this.prisma.perfiles.create({
        data: {
          usuarioId,
          nombres: updateProfileDto.firstName,
          apellidos: updateProfileDto.lastName,
          telefono: updateProfileDto.phone,
        },
      });
    }

    return this.prisma.perfiles.update({
      where: { usuarioId },
      data: {
        nombres: updateProfileDto.firstName,
        apellidos: updateProfileDto.lastName,
        telefono: updateProfileDto.phone,
      },
    });
  }
}
