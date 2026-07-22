import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  CreateSessionRepositoryData,
  RotateSessionRepositoryData,
  SessionEntity,
  SessionRepository,
  UpdateSessionRepositoryData,
} from '../../domain/repositories/session.repository';
import { SessionMapper } from '../mappers/session.mapper';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionRepositoryData): Promise<SessionEntity> {
    const session = await this.prisma.sesiones.create({
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
    });
    return SessionMapper.toEntity(session)!;
  }

  async findById(sesionId: string): Promise<SessionEntity | null> {
    const session = await this.prisma.sesiones.findUnique({
      where: { sesionId },
    });
    return session ? SessionMapper.toEntity(session) : null;
  }

  async findActiveSession(
    usuarioId: number,
    sesionId: string,
  ): Promise<SessionEntity | null> {
    const session = await this.prisma.sesiones.findFirst({
      where: {
        usuarioId,
        sesionId,
        revocado: false,
        expiraEn: { gt: new Date() },
      },
    });
    return session ? SessionMapper.toEntity(session) : null;
  }

  async findActiveSessionsByUser(usuarioId: number): Promise<SessionEntity[]> {
    const sessions = await this.prisma.sesiones.findMany({
      where: {
        usuarioId,
        revocado: false,
        expiraEn: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map((session) => SessionMapper.toEntity(session)!);
  }

  async update(
    sesionId: string,
    data: UpdateSessionRepositoryData,
  ): Promise<SessionEntity> {
    const session = await this.prisma.sesiones.update({
      where: { sesionId },
      data: {
        direccionIp: data.direccionIp,
        usuarioAgente: data.usuarioAgente,
        revocado: data.revocado,
        expiraEn: data.expiraEn,
      },
    });
    return SessionMapper.toEntity(session)!;
  }

  async rotate(
    sesionId: string,
    data: RotateSessionRepositoryData,
  ): Promise<number> {
    const result = await this.prisma.sesiones.updateMany({
      where: {
        sesionId,
        tokenVersion: data.expectedTokenVersion,
        // Solo rota sesiones vivas: una sesión revocada o expirada no debe
        // poder resucitarse por una rotación en vuelo (TOCTOU con logout).
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

  async revoke(sesionId: string): Promise<SessionEntity> {
    const session = await this.prisma.sesiones.update({
      where: { sesionId },
      data: { revocado: true },
    });
    return SessionMapper.toEntity(session)!;
  }
}
