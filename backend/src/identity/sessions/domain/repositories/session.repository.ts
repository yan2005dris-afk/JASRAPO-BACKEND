export interface CreateSessionRepositoryData {
  sesionId: string;
  usuarioId: number;
  hashRefreshToken: string;
  direccionIp?: string | null;
  usuarioAgente?: string | null;
  revocado?: boolean;
  expiraEn: Date;
}

export interface UpdateSessionRepositoryData {
  hashRefreshToken?: string;
  direccionIp?: string | null;
  usuarioAgente?: string | null;
  revocado?: boolean;
  expiraEn?: Date;
}

export interface SessionEntity {
  sesionId: string;
  usuarioId: number;
  hashRefreshToken: string;
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
  abstract revoke(sesionId: string): Promise<SessionEntity>;
}
