import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class NotEmptyBodyPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (value === undefined || value === null) {
      throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
    }

    if (Array.isArray(value)) {
      throw new BadRequestException('El cuerpo de la solicitud no puede ser un arreglo');
    }

    if (typeof value === 'object') {
      if (Object.keys(value as Record<string, unknown>).length === 0) {
        throw new BadRequestException('Debe enviar al menos un campo a actualizar');
      }
    }

    return value;
  }
}
