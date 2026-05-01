import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FindMyProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number) {
    let profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });
    if (!profile) {
      profile = await this.prisma.profiles.create({
        data: { usersId },
      });
    }
    return profile;
  }
}
