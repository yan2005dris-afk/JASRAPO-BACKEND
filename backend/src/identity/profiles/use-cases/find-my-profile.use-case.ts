import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FindMyProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: number) {
    let profile = await this.prisma.perfiles.findUnique({
      where: { usuarioId },
    });
    if (!profile) {
      profile = await this.prisma.perfiles.create({
        data: { usuarioId },
      });
    }
    return profile;
  }
}
