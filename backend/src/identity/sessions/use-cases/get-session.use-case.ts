import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class GetSessionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number, sessionsId: string) {
    return this.prisma.sessions.findFirst({
      where: {
        usersId,
        sessionsId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }
}
