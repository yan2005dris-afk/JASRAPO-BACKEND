import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { InvitationService } from '../../../auth/application/services/invitation.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@LogContext()
@Injectable()
export class ResendInvitationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly invitationService: InvitationService,
    private readonly prisma: PrismaService,
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

    // 3. Reenviar (reutilizando mismo token)
    try {
      // Generador no se llama aquí, reutilizamos el token existente
      // El token plaintext NO está en BD, pero podemos regenerarlo si es necesario
      // Por ahora: marcar emailSentAt = now, decrementar intentos si es necesario

      await this.prisma.usuarioInvitacion.update({
        where: { usuarioInvitacionId: invitation.usuarioInvitacionId },
        data: {
          emailSentAt: new Date(),
          emailAttempts: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // TODO: Disparar email con token plaintext
      // Por ahora: solo marcamos que se intentó reenviar
      // mailService.sendInvitationEmail(user.email, tokenPlain);

      this.logger.log(
        `Invitation re-sent for user ${usuarioId} by admin ${adminId}`,
        {
          invitationId: invitation.usuarioInvitacionId,
          adminId,
        },
      );

      return {
        message: 'Invitación reenviada exitosamente',
        invitationId: invitation.usuarioInvitacionId,
        expiresAt: invitation.expiresAt,
      };
    } catch (error) {
      this.logger.error('Error resending invitation', {
        usuarioId,
        invitationId: invitation.usuarioInvitacionId,
        error: (error as Error).message,
      });
      throw error;
    }
  }
}