import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateLecturaDto {
  @IsInt()
  @Type(() => Number)
  clienteMedidorId: number;

  @IsDateString()
  fecha: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lecturaAnterior: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lecturaActual: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  consumoCalculado?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valorMonetario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  abono?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  saldoPendiente?: number;
}
