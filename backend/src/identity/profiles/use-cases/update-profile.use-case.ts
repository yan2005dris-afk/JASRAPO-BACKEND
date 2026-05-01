import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number, updateProfileDto: UpdateProfileDto) {
    const existing = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!existing) {
      return this.prisma.profiles.create({
        data: {
          usersId,
          firstName: updateProfileDto.firstName,
          lastName: updateProfileDto.lastName,
          phone: updateProfileDto.phone,
        },
      });
    }

    return this.prisma.profiles.update({
      where: { usersId },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
      },
    });
  }
}
