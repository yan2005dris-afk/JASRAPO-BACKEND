import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class ListSessionsByUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number) {
    return this.prisma.sessions.findMany({
      where: {
        usersId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
