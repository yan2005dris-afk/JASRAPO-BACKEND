import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateSessionUseCase } from './use-cases/create-session.use-case';
import { GetSessionUseCase } from './use-cases/get-session.use-case';
import { UpdateSessionUseCase } from './use-cases/update-session.use-case';
import { RevokeSessionUseCase } from './use-cases/revoke-session.use-case';
import { ListSessionsByUserUseCase } from './use-cases/list-sessions-by-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateSessionUseCase,
    private readonly getUseCase: GetSessionUseCase,
    private readonly updateUseCase: UpdateSessionUseCase,
    private readonly revokeUseCase: RevokeSessionUseCase,
    private readonly listByUserUseCase: ListSessionsByUserUseCase,
  ) {}

  async createSession(
    data: Prisma.SessionsCreateInput,
  ): Promise<SessionPostgres> {
    return this.createUseCase.execute(data);
  }

  async getSession(
    usersId: number,
    sessionsId: string,
  ): Promise<SessionPostgres | null> {
    return this.getUseCase.execute(usersId, sessionsId);
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
    return this.updateUseCase.execute(sessionsId, data);
  }

  async revokeSession(sessionsId: string): Promise<SessionPostgres> {
    return this.revokeUseCase.execute(sessionsId);
  }

  async listSessionsByUser(usersId: number): Promise<SessionPostgres[]> {
    return this.listByUserUseCase.execute(usersId);
  }
}
