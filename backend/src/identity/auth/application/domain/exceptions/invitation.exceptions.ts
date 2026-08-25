import { GoneException, NotFoundException } from '@nestjs/common';

export class InvitationNotFoundException extends NotFoundException {
  constructor() {
    super('Invitación no encontrada o token inválido');
  }
}

export class InvitationExpiredException extends GoneException {
  constructor() {
    super('El token de invitación ha expirado');
  }
}

export class InvitationAlreadyUsedException extends GoneException {
  constructor() {
    super('Esta invitación ya ha sido utilizada');
  }
}
