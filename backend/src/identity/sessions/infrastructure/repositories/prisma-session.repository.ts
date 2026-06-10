import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SesionesCreateInput): Promise<any> {
    return this.prisma.sesiones.create({ data });
  }

  async findById(sesionId: string): Promise<any> {
    return this.prisma.sesiones.findUnique({
      where: { sesionId },
    });
  }

  async findActiveSession(usuarioId: number, sesionId: string): Promise<any> {
    return this.prisma.sesiones.findFirst({
      where: {
        usuarioId,
        sesionId,
        revocado: false,
        expiraEn: { gt: new Date() },
      },
    });
  }

  async findActiveSessionsByUser(usuarioId: number): Promise<any[]> {
    return this.prisma.sesiones.findMany({
      where: {
        usuarioId,
        revocado: false,
        expiraEn: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    sesionId: string,
    data: Prisma.SesionesUpdateInput,
  ): Promise<any> {
    return this.prisma.sesiones.update({
      where: { sesionId },
      data,
    });
  }

  async revoke(sesionId: string): Promise<any> {
    return this.prisma.sesiones.update({
      where: { sesionId },
      data: { revocado: true },
    });
  }
}
