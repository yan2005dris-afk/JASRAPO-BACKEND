export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string | number | bigint) {
    super(`${entityName} con ID ${id} no encontrado`);
  }
}

export class EntityAlreadyExistsException extends DomainException {
  constructor(entityName: string, fieldName: string, value: string) {
    super(`${entityName} con ${fieldName} '${value}' ya existe`);
  }
}

export class InvalidDomainOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(message: string = 'No autorizado') {
    super(message);
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(message: string = 'Acceso denegado') {
    super(message);
  }
}
