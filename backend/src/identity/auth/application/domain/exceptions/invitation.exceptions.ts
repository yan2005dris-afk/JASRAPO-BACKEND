import {
  EntityNotFoundException,
  GoneDomainException,
} from 'src/shared/domain/exceptions/domain.exception';

export class InvitationNotFoundException extends EntityNotFoundException {
  constructor() {
    super('Invitación', 'token inválido o no encontrada');
  }
}

export class InvitationExpiredException extends GoneDomainException {
  constructor() {
    super('El token de invitación ha expirado');
  }
}

export class InvitationAlreadyUsedException extends GoneDomainException {
  constructor() {
    super('Esta invitación ya ha sido utilizada');
  }
}
