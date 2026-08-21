import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { InvitationTokenGeneratorService } from './invitation-token-generator.service';
import { createHash } from 'crypto';
import {
  InvitationNotFoundException,
  InvitationExpiredException,
  InvitationAlreadyUsedException,
} from '../domain/exceptions/invitation.exceptions';
import { Usuarios, UsuarioInvitacion } from '@prisma/client';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenGenerator: InvitationTokenGeneratorService,
  ) {}

  async createAndSendInvitation(
    usuario: Usuarios,
    invitedByUserId?: number,
  ): Promise<UsuarioInvitacion> {
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
      },
      include: {
        usuario: true,
        invitedBy: true,
      },
    });

    // TODO: Implementar envío de email con token plaintext
    // mailService.sendInvitationEmail(usuario.email, tokenPlain);

    return invitation;
  }

  async previewInvitation(
    tokenPlain: string,
  ): Promise<{ usuario: Usuarios; expiresAt: Date; acceptedAt: Date | null }> {
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
  ): Promise<Usuarios> {
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
          updatedAt: new Date(),
        },
      });

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user with hashed password
      const updatedUser = await tx.usuarios.update({
        where: { usuarioId: invitation.usuarioId },
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
