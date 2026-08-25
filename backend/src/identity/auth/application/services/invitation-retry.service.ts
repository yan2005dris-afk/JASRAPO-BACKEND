import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { createHash, randomBytes } from 'crypto';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 5 * 60 * 1000; // 5 minutos

@Injectable()
export class InvitationRetryService {
  private readonly maxRetries: number;
  private readonly backoffMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.maxRetries = parseInt(
      this.config.get('INVITATION_MAX_RETRIES') ||
        DEFAULT_MAX_RETRIES.toString(),
      10,
    );
    this.backoffMs = parseInt(
      this.config.get('INVITATION_RETRY_BACKOFF_MS') ||
        DEFAULT_BACKOFF_MS.toString(),
      10,
    );
  }

  async retryFailedInvitations(): Promise<{
    attempted: number;
    succeeded: number;
    failed: number;
  }> {
    const stats = { attempted: 0, succeeded: 0, failed: 0 };

    const failedInvitations = await this.prisma.usuarioInvitacion.findMany({
      where: {
        emailFailedAt: { not: null },
        emailAttempts: { lt: this.maxRetries },
        expiresAt: { gt: new Date() }, // Solo no-expiradas
        acceptedAt: null, // Solo no-aceptadas
      },
      include: {
        usuario: {
          select: {
            usuarioId: true,
            email: true,
            nombres: true,
          },
        },
      },
      orderBy: { emailFailedAt: 'asc' }, // FIFO
      take: 50, // Batch de 50
    });

    for (const invitation of failedInvitations) {
      stats.attempted++;

      try {
        if (!invitation.usuario) {
          this.logger.warn(
            `Skipping invitation ${invitation.usuarioInvitacionId}: usuario deleted`,
          );
          stats.failed++;
          continue;
        }

        // Reconstruir token desde tokenHash no es posible (es one-way hash)
        // En su lugar, generar nuevo token y actualizar
        const newTokenPlain = this.generateNewToken();
        const newTokenHash = createHash('sha256')
          .update(newTokenPlain)
          .digest('hex');

        const expiresAt = new Date();
        expiresAt.setHours(
          expiresAt.getHours() +
            parseInt(process.env.INVITATION_TTL_HOURS || '48', 10),
        );

        // Actualizar invitation con nuevo token
        await this.prisma.usuarioInvitacion.update({
          where: { usuarioInvitacionId: invitation.usuarioInvitacionId },
          data: {
            tokenHash: newTokenHash,
            expiresAt,
            emailAttempts: { increment: 1 },
            emailFailedAt: null, // Reset failed flag
            emailSentAt: new Date(),
          },
        });

        // Intentar envío
        await this.mailService.sendInvitation(
          invitation.usuario.email,
          invitation.usuario.nombres || '',
          newTokenPlain,
          expiresAt,
        );

        stats.succeeded++;
        this.logger.log(
          `Retry success for invitation ${invitation.usuarioInvitacionId} (usuario=${invitation.usuario.usuarioId})`,
        );
      } catch (error) {
        stats.failed++;
        this.logger.error(
          `Retry failed for invitation ${invitation.usuarioInvitacionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );

        // Marcar como failed si aún tenemos reintentos
        if (invitation.emailAttempts < this.maxRetries - 1) {
          try {
            await this.prisma.usuarioInvitacion.update({
              where: { usuarioInvitacionId: invitation.usuarioInvitacionId },
              data: { emailFailedAt: new Date() },
            });
          } catch (updateError) {
            this.logger.error(
              `Failed to update invitation status: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`,
            );
          }
        }
      }
    }

    this.logger.log(
      `Invitation retry cycle completed: attempted=${stats.attempted}, succeeded=${stats.succeeded}, failed=${stats.failed}`,
    );

    return stats;
  }

  private generateNewToken(): string {
    return randomBytes(64).toString('hex');
  }
}
