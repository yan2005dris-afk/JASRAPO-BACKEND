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

export class InvalidDomainOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
