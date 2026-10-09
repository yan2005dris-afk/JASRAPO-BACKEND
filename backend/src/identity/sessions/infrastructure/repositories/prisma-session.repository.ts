import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { sessionInclude, type SessionRow } from './session.include';
import type {
  CreateSessionRepositoryData,
  UpdateSessionRepositoryData,
  RotateSessionRepositoryData,
} from '../../domain/types/session.types';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionRepositoryData): Promise<SessionRow> {
    return this.prisma.sesiones.create({
      data: {
        sesionId: data.sesionId,
        usuarioId: data.usuarioId,
        sessionSecret: data.sessionSecret,
        tokenVersion: data.tokenVersion,
        direccionIp: data.direccionIp,
        usuarioAgente: data.usuarioAgente,
        revocado: data.revocado ?? false,
        expiraEn: data.expiraEn,
      },
      include: sessionInclude,
    });
  }

  async findById(sesionId: string): Promise<SessionRow | null> {
    return this.prisma.sesiones.findUnique({
      where: { sesionId },
      include: sessionInclude,
    });
  }

  async findActiveSession(
    usuarioId: number,
    sesionId: string,
  ): Promise<SessionRow | null> {
    return this.prisma.sesiones.findFirst({
      where: {
        usuarioId,
        sesionId,
        revocado: false,
        expiraEn: { gt: new Date() },
      },
      include: sessionInclude,
    });
  }

  async findActiveSessionsByUser(usuarioId: number): Promise<SessionRow[]> {
    return this.prisma.sesiones.findMany({
      where: {
        usuarioId,
        revocado: false,
        expiraEn: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      include: sessionInclude,
    });
  }

  async update(
    sesionId: string,
    data: UpdateSessionRepositoryData,
  ): Promise<SessionRow> {
    return this.prisma.sesiones.update({
      where: { sesionId },
      data: {
        direccionIp: data.direccionIp,
        usuarioAgente: data.usuarioAgente,
        revocado: data.revocado,
        expiraEn: data.expiraEn,
      },
      include: sessionInclude,
    });
  }

  async rotate(
    sesionId: string,
    data: RotateSessionRepositoryData,
  ): Promise<number> {
    const result = await this.prisma.sesiones.updateMany({
      where: {
        sesionId,
        tokenVersion: data.expectedTokenVersion,
        // Solo rota sesiones vivas: una sesion revocada o expirada no debe
        // poder resucitarse por una rotacion en vuelo (TOCTOU con logout).
        revocado: false,
        expiraEn: { gt: new Date() },
      },
      data: {
        sessionSecret: data.sessionSecret,
        tokenVersion: { increment: 1 },
        direccionIp: data.direccionIp,
        usuarioAgente: data.usuarioAgente,
        expiraEn: data.expiraEn,
      },
    });
    return result.count;
  }

  async revoke(sesionId: string): Promise<SessionRow> {
    return this.prisma.sesiones.update({
      where: { sesionId },
      data: { revocado: true },
      include: sessionInclude,
    });
  }

  async revokeAllByUser(usuarioId: number): Promise<number> {
    const result = await this.prisma.sesiones.updateMany({
      where: { usuarioId, revocado: false },
      data: { revocado: true },
    });
    return result.count;
  }
}
