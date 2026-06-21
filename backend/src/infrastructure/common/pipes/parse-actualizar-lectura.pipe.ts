import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseActualizarLecturaPipe implements PipeTransform {
  transform(value: any): any {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const transformed = { ...value };

    if (transformed.medidorId !== undefined && transformed.medidorId !== null) {
      try {
        transformed.medidorId = BigInt(transformed.medidorId);
      } catch {
        throw new BadRequestException('medidorId debe ser un valor numérico válido');
      }
    }

    if (transformed.fecha !== undefined && transformed.fecha !== null) {
      const date = new Date(transformed.fecha);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('fecha debe ser una fecha ISO 8601 válida');
      }
      transformed.fecha = date;
    }

    return transformed;
  }
}
