import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { InvitationTokenGeneratorService } from '../../../auth/application/services/invitation-token-generator.service';
import { createHash } from 'crypto';

@LogContext()
@Injectable()
export class ResendInvitationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly tokenGenerator: InvitationTokenGeneratorService,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    usuarioId: number,
    adminId: number,
  ): Promise<{ message: string; invitationId: number; expiresAt: Date }> {
    // 1. Validar usuario existe y no está eliminado
    const user = await this.userRepository.findById(usuarioId);
    if (!user || user.deletedAt) {
      throw new EntityNotFoundException('Usuario', usuarioId);
    }

    // 2. Buscar invitación pendiente y no expirada
    const invitation = await this.prisma.usuarioInvitacion.findFirst({
      where: {
        usuarioId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!invitation) {
      throw new BadRequestException(
        'No hay invitación pendiente para este usuario',
      );
    }

    // 3. Generar nuevo token y reenviar
    try {
      const ttlHours = parseInt(process.env.INVITATION_TTL_HOURS || '48', 10);
      const { tokenPlain, tokenHash } = this.tokenGenerator.generate();

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      await this.prisma.usuarioInvitacion.update({
        where: { usuarioInvitacionId: invitation.usuarioInvitacionId },
        data: {
          tokenHash,
          expiresAt,
          emailSentAt: new Date(),
          emailAttempts: { increment: 1 },
          emailFailedAt: null,
          updatedAt: new Date(),
        },
      });

      await this.mailService.sendInvitation(
        user.email,
        user.nombres || '',
        tokenPlain,
        expiresAt,
      );

      this.logger.log(
        `Invitation re-sent for user ${usuarioId} by admin ${adminId}`,
      );

      return {
        message: 'Invitación reenviada exitosamente',
        invitationId: invitation.usuarioInvitacionId,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(
        `Error resending invitation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}