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
  constructor(
    entityName: string,
    fieldNameOrIdentifier: string,
    value?: string | number | bigint,
  ) {
    if (value !== undefined) {
      super(`${entityName} con ${fieldNameOrIdentifier} '${value}' ya existe`);
    } else {
      super(`${entityName} '${fieldNameOrIdentifier}' ya existe`);
    }
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

/**
 * Error de validación de input en un use-case.
 *
 * Es la versión de dominio de `BadRequestException` de Nest. Use-cases y
 * application services deben tirar esta excepción cuando un input del
 * caller no cumple las invariantes del dominio (formato, rangos,
 * campos requeridos). El `GlobalExceptionFilter` la traduce a HTTP 400.
 *
 * Los controllers de Nest SÍ pueden usar `BadRequestException` cuando
 * reciben un input que ni siquiera pasa la capa HTTP (ej: shape
 * incorrecto del body antes de llegar al use-case). El acoplamiento
 * que SC-188 busca eliminar es el de los use-cases al framework.
 */
export class DomainValidationException extends DomainException {
  readonly details?: Record<string, string[]>;
  constructor(message: string, details?: Record<string, string[]>) {
    super(message);
    this.details = details;
  }
}
