import { Injectable, BadRequestException } from '@nestjs/common';
import { InvitationService } from '../services/invitation.service';
import { AcceptInvitationDto } from '../../interfaces/dto/accept-invitation.dto';
import { UserEntity } from 'src/identity/users/domain/entities/user.entity';
import { UserRepository } from 'src/identity/users/domain/repositories/user.repository';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: AcceptInvitationDto): Promise<UserEntity> {
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException({
        errors: { password_confirmation: 'Las contraseñas no coinciden' },
      });
    }

    const usuario = await this.invitationService.acceptInvitation(
      dto.token,
      dto.password,
      dto.terms_version || 'v0',
    );

    return (
      (await this.userRepository.findById(usuario.usuarioId)) ||
      new UserEntity({ usuarioId: usuario.usuarioId })
    );
  }
}
