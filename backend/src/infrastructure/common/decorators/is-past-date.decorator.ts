import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPastDate', async: false })
export class IsPastDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    // La presencia/formato los cubren @IsOptional e @IsDateString.
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (typeof value !== 'string') {
      return true;
    }

    const fecha = new Date(value);
    if (Number.isNaN(fecha.getTime())) {
      return true;
    }

    return fecha.getTime() <= Date.now();
  }

  defaultMessage() {
    return 'La fecha debe estar en el pasado';
  }
}

export function IsPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPastDateConstraint,
    });
  };
}
