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
