export interface CreateSessionRepositoryData {
  sesionId: string;
  usuarioId: number;
  sessionSecret: string;
  tokenVersion: number;
  direccionIp?: string | null;
  usuarioAgente?: string | null;
  revocado?: boolean;
  expiraEn: Date;
}

export interface UpdateSessionRepositoryData {
  direccionIp?: string | null;
  usuarioAgente?: string | null;
  revocado?: boolean;
  expiraEn?: Date;
}

export interface RotateSessionRepositoryData {
  expectedTokenVersion: number;
  sessionSecret: string;
  direccionIp?: string | null;
  usuarioAgente?: string | null;
  expiraEn: Date;
}

export interface SessionEntity {
  sesionId: string;
  usuarioId: number;
  sessionSecret: string;
  tokenVersion: number;
  direccionIp: string | null;
  usuarioAgente: string | null;
  revocado: boolean;
  expiraEn: Date;
  createdAt: Date;
}

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
}
