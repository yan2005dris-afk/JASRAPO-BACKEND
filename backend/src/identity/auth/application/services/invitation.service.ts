import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { InvitationTokenGeneratorService } from './invitation-token-generator.service';
import { createHash } from 'crypto';
import { MailService } from 'src/infrastructure/mail/application/mail.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import {
  InvitationNotFoundException,
  InvitationExpiredException,
  InvitationAlreadyUsedException,
} from '../domain/exceptions/invitation.exceptions';

/**
 * Datos mínimos del usuario necesarios para crear y enviar una invitación.
 */
export type InvitationUser = {
  usuarioId: number;
  email: string;
  nombres: string | null;
};

@Injectable()
export class InvitationService {  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenGenerator: InvitationTokenGeneratorService,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async createAndSendInvitation(
    usuario: InvitationUser,
    invitedByUserId?: number,
  ) {
    const ttlHours = parseInt(process.env.INVITATION_TTL_HOURS || '48', 10);
    const { tokenPlain, tokenHash } = this.tokenGenerator.generate();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    const invitation = await this.prisma.usuarioInvitacion.create({
      data: {
        usuarioId: usuario.usuarioId,
        tokenHash,
        expiresAt,
        invitedByUserId: invitedByUserId ?? null,
        termsVersion: 'v0',
        emailSentAt: new Date(),
      },
      include: {
        usuario: true,
        invitedBy: true,
      },
    });

    try {
      await this.mailService.sendInvitation(
        usuario.email,
        usuario.nombres || '',
        tokenPlain,
        expiresAt,
      );
      this.logger.log(
        `Invitation email queued for usuario=${usuario.usuarioId} (${usuario.email})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue invitation email for usuario=${usuario.usuarioId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await this.prisma.usuarioInvitacion.update({
        where: { usuarioInvitacionId: invitation.usuarioInvitacionId },
        data: {
          emailFailedAt: new Date(),
          emailAttempts: 1,
        },
      });
    }

    return invitation;
  }

  async previewInvitation(tokenPlain: string) {
    const tokenHash = createHash('sha256').update(tokenPlain).digest('hex');

    const invitation = await this.prisma.usuarioInvitacion.findUnique({
      where: { tokenHash },
      include: { usuario: true },
    });

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    if (invitation.acceptedAt !== null) {
      throw new InvitationAlreadyUsedException();
    }

    if (invitation.expiresAt < new Date()) {
      throw new InvitationExpiredException();
    }

    return {
      usuario: invitation.usuario,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
    };
  }

  async acceptInvitation(
    tokenPlain: string,
    password: string,
    termsVersion: string,
  ) {
    const tokenHash = createHash('sha256').update(tokenPlain).digest('hex');

    const invitation = await this.prisma.usuarioInvitacion.findUnique({
      where: { tokenHash },
      include: { usuario: true },
    });

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    if (invitation.expiresAt < new Date()) {
      throw new InvitationExpiredException();
    }

    if (invitation.acceptedAt !== null) {
      throw new InvitationAlreadyUsedException();
    }

    return await this.prisma.$transaction(async (tx) => {
      // SELECT FOR UPDATE equivalent: lock the row
      const locked = await tx.usuarioInvitacion.findUnique({
        where: { tokenHash },
      });

      if (!locked || locked.acceptedAt !== null) {
        throw new InvitationAlreadyUsedException();
      }

      // Mark invitation as accepted
      await tx.usuarioInvitacion.update({
        where: { tokenHash },
        data: {
          acceptedAt: new Date(),
          termsVersion,
          updatedAt: new Date(),
        },
      });

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user with hashed password
      const updatedUser = await tx.usuarios.update({
        where: { usuarioId: invitation.usuarioId ?? undefined },
        data: {
          clave: hashedPassword,
          updatedAt: new Date(),
        },
      });

      return updatedUser;
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
