import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RevokeSessionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(sessionsId: string) {
    return this.prisma.sessions.update({
      where: { sessionsId },
      data: { isRevoked: true },
    });
  }
}
