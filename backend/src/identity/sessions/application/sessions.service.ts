import { Injectable } from '@nestjs/common';
import { CreateSessionUseCase } from './use-cases/create-session.use-case';
import { GetSessionUseCase } from './use-cases/get-session.use-case';
import { UpdateSessionUseCase } from './use-cases/update-session.use-case';
import { RevokeSessionUseCase } from './use-cases/revoke-session.use-case';
import { ListSessionsByUserUseCase } from './use-cases/list-sessions-by-user.use-case';
import { SessionRepository } from '../domain/repositories/session.repository';
import type { SessionRow } from '../domain/types/session.types';
import type {
  CreateSessionRepositoryData,
  UpdateSessionRepositoryData,
  RotateSessionRepositoryData,
} from '../domain/types/session.types';

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

  async createSession(data: CreateSessionRepositoryData): Promise<SessionRow> {
    return this.createUseCase.execute(data);
  }

  async getSession(
    usuarioId: number,
    sesionId: string,
  ): Promise<SessionRow | null> {
    return this.getUseCase.execute(usuarioId, sesionId);
  }

  async getSessionById(sesionId: string): Promise<SessionRow | null> {
    return this.sessionRepository.findById(sesionId);
  }

  async updateSession(
    sesionId: string,
    data: UpdateSessionRepositoryData,
  ): Promise<SessionRow> {
    return this.updateUseCase.execute(sesionId, data);
  }

  async rotateSession(
    sesionId: string,
    data: RotateSessionRepositoryData,
  ): Promise<number> {
    return this.sessionRepository.rotate(sesionId, data);
  }

  async revokeSession(sesionId: string): Promise<SessionRow> {
    return this.revokeUseCase.execute(sesionId);
  }

  async revokeAllUserSessions(usuarioId: number): Promise<number> {
    return this.sessionRepository.revokeAllByUser(usuarioId);
  }

  async listSessionsByUser(usuarioId: number): Promise<SessionRow[]> {
    return this.listByUserUseCase.execute(usuarioId);
  }
}
