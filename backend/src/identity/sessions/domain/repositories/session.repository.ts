import type { SessionRow } from '../types/session.types';
import type {
  CreateSessionRepositoryData,
  UpdateSessionRepositoryData,
  RotateSessionRepositoryData,
} from '../types/session.types';

export abstract class SessionRepository {
  abstract create(data: CreateSessionRepositoryData): Promise<SessionRow>;
  abstract findById(sesionId: string): Promise<SessionRow | null>;
  abstract findActiveSession(
    usuarioId: number,
    sesionId: string,
  ): Promise<SessionRow | null>;
  abstract findActiveSessionsByUser(usuarioId: number): Promise<SessionRow[]>;
  abstract update(
    sesionId: string,
    data: UpdateSessionRepositoryData,
  ): Promise<SessionRow>;
  abstract rotate(
    sesionId: string,
    data: RotateSessionRepositoryData,
  ): Promise<number>;
  abstract revoke(sesionId: string): Promise<SessionRow>;
  abstract revokeAllByUser(usuarioId: number): Promise<number>;
}
