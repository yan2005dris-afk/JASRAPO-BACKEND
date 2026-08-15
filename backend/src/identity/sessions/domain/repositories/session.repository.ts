import type { SessionEntity } from '../entities/session.entity';
import type {
  CreateSessionRepositoryData,
  UpdateSessionRepositoryData,
  RotateSessionRepositoryData,
} from '../types/session.types';

export type {
  SessionEntity,
  CreateSessionRepositoryData,
  UpdateSessionRepositoryData,
  RotateSessionRepositoryData,
};

export abstract class SessionRepository {
  abstract create(data: CreateSessionRepositoryData): Promise<SessionEntity>;
  abstract findById(sesionId: string): Promise<SessionEntity | null>;
  abstract findActiveSession(
    usuarioId: number,
    sesionId: string,
  ): Promise<SessionEntity | null>;
  abstract findActiveSessionsByUser(
    usuarioId: number,
  ): Promise<SessionEntity[]>;
  abstract update(
    sesionId: string,
    data: UpdateSessionRepositoryData,
  ): Promise<SessionEntity>;
  abstract rotate(
    sesionId: string,
    data: RotateSessionRepositoryData,
  ): Promise<number>;
  abstract revoke(sesionId: string): Promise<SessionEntity>;
  abstract revokeAllByUser(usuarioId: number): Promise<number>;
}
