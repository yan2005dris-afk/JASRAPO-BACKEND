import { Injectable } from '@nestjs/common';
import { CreateSessionUseCase } from './use-cases/create-session.use-case';
import { GetSessionUseCase } from './use-cases/get-session.use-case';
import { UpdateSessionUseCase } from './use-cases/update-session.use-case';
import { RevokeSessionUseCase } from './use-cases/revoke-session.use-case';
import { ListSessionsByUserUseCase } from './use-cases/list-sessions-by-user.use-case';
import {
  CreateSessionRepositoryData,
  RotateSessionRepositoryData,
  SessionEntity,
  SessionRepository,
  UpdateSessionRepositoryData,
} from '../domain/repositories/session.repository';

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
    data: CreateSessionRepositoryData,
  ): Promise<SessionEntity> {
    return this.createUseCase.execute(data);
  }

  async getSession(
    usuarioId: number,
    sesionId: string,
  ): Promise<SessionEntity | null> {
    return this.getUseCase.execute(usuarioId, sesionId);
  }

  async getSessionById(sesionId: string): Promise<SessionEntity | null> {
    return this.sessionRepository.findById(sesionId);
  }

  async updateSession(
    sesionId: string,
    data: UpdateSessionRepositoryData,
  ): Promise<SessionEntity> {
    return this.updateUseCase.execute(sesionId, data);
  }

  async rotateSession(
    sesionId: string,
    data: RotateSessionRepositoryData,
  ): Promise<number> {
    return this.sessionRepository.rotate(sesionId, data);
  }

  async revokeSession(sesionId: string): Promise<SessionEntity> {
    return this.revokeUseCase.execute(sesionId);
  }

  async listSessionsByUser(usuarioId: number): Promise<SessionEntity[]> {
    return this.listByUserUseCase.execute(usuarioId);
  }
}
