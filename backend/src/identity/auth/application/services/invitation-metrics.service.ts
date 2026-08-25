import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

export interface InvitationMetrics {
  totalCreated: number;
  totalAccepted: number;
  totalPending: number;
  totalExpired: number;
  totalFailed: number;
  acceptanceRate: number; // % de invitaciones aceptadas vs creadas
  avgTimeToAcceptance: number; // horas
}

@Injectable()
export class InvitationMetricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getMetrics(): Promise<InvitationMetrics> {
    const now = new Date();

    const [totalCreated, totalAccepted, totalExpired, failedEmails] =
      await Promise.all([
        this.prisma.usuarioInvitacion.count(),
        this.prisma.usuarioInvitacion.count({
          where: { acceptedAt: { not: null } },
        }),
        this.prisma.usuarioInvitacion.count({
          where: { expiresAt: { lt: now }, acceptedAt: null },
        }),
        this.prisma.usuarioInvitacion.count({
          where: { emailFailedAt: { not: null } },
        }),
      ]);

    const totalPending = await this.prisma.usuarioInvitacion.count({
      where: {
        acceptedAt: null,
        expiresAt: { gt: now },
      },
    });

    const totalFailed = failedEmails;

    const acceptanceRate =
      totalCreated > 0 ? (totalAccepted / totalCreated) * 100 : 0;

    // Calcular promedio de tiempo a aceptación para invitaciones aceptadas
    const acceptedWithTime = await this.prisma.usuarioInvitacion.findMany({
      where: { acceptedAt: { not: null } },
      select: { createdAt: true, acceptedAt: true },
      take: 100,
    });

    let avgTimeToAcceptance = 0;
    if (acceptedWithTime.length > 0) {
      const totalMs = acceptedWithTime.reduce((sum, inv) => {
        return (
          sum + (inv.acceptedAt!.getTime() - (inv.createdAt?.getTime() || 0))
        );
      }, 0);
      avgTimeToAcceptance =
        totalMs / acceptedWithTime.length / (1000 * 60 * 60); // convertir a horas
    }

    return {
      totalCreated,
      totalAccepted,
      totalPending,
      totalExpired,
      totalFailed,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      avgTimeToAcceptance: Math.round(avgTimeToAcceptance * 100) / 100,
    };
  }

  async logMetrics(): Promise<void> {
    const metrics = await this.getMetrics();
    this.logger.log(`Invitation Metrics: ${JSON.stringify(metrics)}`);
  }
}
