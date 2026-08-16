import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidDateRange', async: false })
export class IsValidDateRangeConstraint implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments) {
    const { object } = args;
    const desde = (object as Record<string, unknown>).fechaDesde;
    const hasta = (object as Record<string, unknown>).fechaHasta;

    // La validación cruzada solo aplica cuando ambos extremos vienen definidos.
    if (desde === undefined || desde === null || hasta === undefined || hasta === null) {
      return true;
    }
    if (typeof desde !== 'string' || typeof hasta !== 'string') {
      return true;
    }

    // Las fechas ISO YYYY-MM-DD se comparan lexicográficamente de forma segura.
    return desde <= hasta;
  }

  defaultMessage() {
    return 'fechaDesde no puede ser mayor que fechaHasta';
  }
}

export function IsValidDateRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDateRangeConstraint,
    });
  };
}