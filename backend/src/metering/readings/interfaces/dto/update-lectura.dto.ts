import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsISO8601, IsNumberString, IsOptional } from 'class-validator';
import { CrearLecturaDto } from './create-lectura.dto';

export class ActualizarLecturaDto extends PartialType(CrearLecturaDto) {
  @IsOptional()
  @IsNumberString({}, { message: 'medidorId debe ser un valor numérico válido' })
  @Transform(({ value }) => (value !== undefined ? BigInt(value) : undefined))
  medidorId?: string | number;

  @IsOptional()
  @IsISO8601({}, { message: 'fecha debe ser una fecha ISO 8601 válida' })
  @Transform(({ value }) => (value !== undefined ? new Date(value) : undefined))
  fecha?: string;
}
