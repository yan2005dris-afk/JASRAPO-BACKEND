import { Injectable } from '@nestjs/common';
import { InvitationService } from '../services/invitation.service';
import { AcceptInvitationDto } from '../../interfaces/dto/accept-invitation.dto';
import { UserEntity } from 'src/identity/users/domain/entities/user.entity';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(private readonly invitationService: InvitationService) {}

  async execute(dto: AcceptInvitationDto): Promise<UserEntity> {
    const usuario = await this.invitationService.acceptInvitation(
      dto.token,
      dto.password,
      'v0',
    );

    return new UserEntity({
      usuarioId: usuario.usuarioId,
      email: usuario.email,
      clave: usuario.clave || '',
      rolId: usuario.rolId,
      deletedAt: usuario.deletedAt,
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      telefono: usuario.telefono || '',
      avatar: usuario.avatar,
      intentosFallidos: usuario.intentosFallidos,
      ultimoIntentoFallidoEn: usuario.ultimoIntentoFallidoEn,
      bloqueadoHasta: usuario.bloqueadoHasta,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    });
  }
}
