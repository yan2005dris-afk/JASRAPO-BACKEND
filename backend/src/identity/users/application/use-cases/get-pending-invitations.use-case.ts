import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

export interface PendingInvitation {
  invitationId: number;
  usuarioId: number | null;
  email: string;
  nombre: string | null;
  expiresAt: Date;
  emailSentAt: Date | null;
  emailFailedAt: Date | null;
  emailAttempts: number;
  createdAt: Date | null;
  status: 'pending' | 'failed' | 'pending_retry';
}

@LogContext()
@Injectable()
export class GetPendingInvitationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<PendingInvitation[]> {
    const invitations = await this.prisma.usuarioInvitacion.findMany({
      where: {
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        usuarioInvitacionId: true,
        usuarioId: true,
        usuario: {
          select: {
            email: true,
            nombres: true,
          },
        },
        expiresAt: true,
        emailSentAt: true,
        emailFailedAt: true,
        emailAttempts: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => ({
      invitationId: inv.usuarioInvitacionId,
      usuarioId: inv.usuarioId,
      email: inv.usuario?.email || 'unknown',
      nombre: inv.usuario?.nombres || null,
      expiresAt: inv.expiresAt,
      emailSentAt: inv.emailSentAt,
      emailFailedAt: inv.emailFailedAt,
      emailAttempts: inv.emailAttempts,
      createdAt: inv.createdAt,
      status: this.getStatus(inv.emailFailedAt, inv.emailSentAt),
    }));
  }

  private getStatus(
    emailFailedAt: Date | null,
    emailSentAt: Date | null,
  ): 'pending' | 'failed' | 'pending_retry' {
    if (emailFailedAt) {
      return 'failed';
    }
    if (emailSentAt) {
      return 'pending_retry';
    }
    return 'pending';
  }
}