import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateSessionUseCase } from '../use-cases/create-session.use-case';
import { GetSessionUseCase } from '../use-cases/get-session.use-case';
import { UpdateSessionUseCase } from '../use-cases/update-session.use-case';
import { RevokeSessionUseCase } from '../use-cases/revoke-session.use-case';
import { ListSessionsByUserUseCase } from '../use-cases/list-sessions-by-user.use-case';
import { SessionRepository } from '../../domain/repositories/session.repository';

export interface SessionPostgres {
  sesionId: string;
  usuarioId: number;
  hashRefreshToken: string;
  direccionIp: string | null;
  usuarioAgente: string | null;
  revocado: boolean;
  expiraEn: Date;
  createdAt: Date;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly createUseCase: CreateSessionUseCase,
    private readonly getUseCase: GetSessionUseCase,
    private readonly updateUseCase: UpdateSessionUseCase,
    private readonly revokeUseCase: RevokeSessionUseCase,
    private readonly listByUserUseCase: ListSessionsByUserUseCase,
  ) {}

  async createSession(
    data: Prisma.SesionesCreateInput,
  ): Promise<SessionPostgres> {
    return this.createUseCase.execute(data);
  }

  async getSession(
    usuarioId: number,
    sesionId: string,
  ): Promise<SessionPostgres | null> {
    return this.getUseCase.execute(usuarioId, sesionId);
  }

  async getSessionById(sesionId: string): Promise<SessionPostgres | null> {
    return this.sessionRepository.findById(sesionId);
  }

  async updateSession(
    sesionId: string,
    data: Prisma.SesionesUpdateInput,
  ): Promise<SessionPostgres> {
    return this.updateUseCase.execute(sesionId, data);
  }

  async revokeSession(sesionId: string): Promise<SessionPostgres> {
    return this.revokeUseCase.execute(sesionId);
  }

  async listSessionsByUser(usuarioId: number): Promise<SessionPostgres[]> {
    return this.listByUserUseCase.execute(usuarioId);
  }
}
