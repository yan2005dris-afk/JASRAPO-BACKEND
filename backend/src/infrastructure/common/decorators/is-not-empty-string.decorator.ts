import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isNotEmptyString } from '../util/validation.util';

@ValidatorConstraint({ name: 'isNotEmptyString', async: false })
export class IsNotEmptyStringConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return isNotEmptyString(value);
  }

  defaultMessage() {
    return 'El campo no puede estar vacío o ser solo espacios/comillas';
  }
}

export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotEmptyStringConstraint,
    });
  };
}
