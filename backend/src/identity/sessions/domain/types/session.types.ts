/**
 * Re-export canonico de `SessionRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/session.include.ts`
 * (donde vive `sessionInclude`, el detalle Prisma), pero el dominio
 * consume `SessionRow` desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { SessionRow } from '../../infrastructure/repositories/session.include';

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
