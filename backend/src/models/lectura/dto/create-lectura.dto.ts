import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';

export class CreateLecturaDto {
  @IsInt()
  @Type(() => Number)
  contratoId: number;

  @IsString()
  periodo: string;

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

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lecturaInicial: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  consumoCalculado?: number;

  @IsOptional()
  @IsString()
  fotoUrlMinIo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tieneAnomalia?: boolean;

  @IsOptional()
  @IsString()
  descripcionAnomalia?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  isValidada?: boolean;
}
