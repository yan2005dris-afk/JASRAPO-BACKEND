import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CrearLecturaDto } from './create-lectura.dto';

export class ActualizarLecturaDto extends PartialType(CrearLecturaDto) {
  @Transform(({ value }) => (value !== undefined ? BigInt(value) : undefined))
  declare medidorId?: string | number;

  @Transform(({ value }) => (value !== undefined ? new Date(value) : undefined))
  declare fecha?: string;
}
