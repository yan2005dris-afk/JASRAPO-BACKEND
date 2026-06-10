import { Prisma } from 'src/generated/prisma/client';

export abstract class SessionRepository {
  abstract create(data: Prisma.SesionesCreateInput): Promise<any>;
  abstract findById(sesionId: string): Promise<any | null>;
  abstract findActiveSession(usuarioId: number, sesionId: string): Promise<any | null>;
  abstract findActiveSessionsByUser(usuarioId: number): Promise<any[]>;
  abstract update(sesionId: string, data: Prisma.SesionesUpdateInput): Promise<any>;
  abstract revoke(sesionId: string): Promise<any>;
}
