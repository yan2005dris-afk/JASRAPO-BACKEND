import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UpdateSessionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(sessionsId: string, data: Prisma.SessionsUpdateInput) {
    return this.prisma.sessions.update({
      where: { sessionsId },
      data,
    });
  }
}
