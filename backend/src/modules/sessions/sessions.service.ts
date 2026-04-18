import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

export interface SessionPostgres {
  sessionsId: string;
  usersId: number;
  refreshTokenHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(
    data: Prisma.SessionsCreateInput,
  ): Promise<SessionPostgres> {
    return this.prisma.sessions.create({ data });
  }

  async getSession(
    usersId: number,
    sessionsId: string,
  ): Promise<SessionPostgres | null> {
    return this.prisma.sessions.findFirst({
      where: {
        usersId,
        sessionsId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async getSessionById(sessionsId: string): Promise<SessionPostgres | null> {
    return this.prisma.sessions.findUnique({
      where: { sessionsId },
    });
  }

  async updateSession(
    sessionsId: string,
    data: Prisma.SessionsUpdateInput,
  ): Promise<SessionPostgres> {
    return this.prisma.sessions.update({
      where: { sessionsId },
      data,
    });
  }

  async revokeSession(sessionsId: string): Promise<SessionPostgres> {
    return this.prisma.sessions.update({
      where: { sessionsId },
      data: { isRevoked: true },
    });
  }

  /*   async deleteSession(sessionsId: string): Promise<void> {
    await this.prisma.sessions.delete({ where: { sessionsId } });
  } */

  async listSessionsByUser(usersId: number): Promise<SessionPostgres[]> {
    return this.prisma.sessions.findMany({
      where: {
        usersId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /*   async deleteExpiredSessions(): Promise<number> {
    const result = await this.prisma.sessions.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
 */
  /*   async deleteAllUserSessions(usersId: number): Promise<void> {
    await this.prisma.sessions.deleteMany({
      where: { usersId },
    });
  } */
}
