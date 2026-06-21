import {
  IsBoolean,
  IsBase64,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CrearLecturaDto {
  @IsNotEmpty() fecha: string;
  @IsNotEmpty() @IsNumber() lecturaAnterior: number;
  @IsNotEmpty() @IsNumber() lecturaActual: number;
  @IsOptional() @IsNumber() consumoCalculado?: number;
  @IsNotEmpty() medidorId: string | number;
  @IsOptional() @IsString() @IsNotEmptyString() descripcionAnomalia?: string;
  @IsOptional() @IsString() @IsNotEmptyString() fotoUrl?: string;
  @IsOptional() @IsString() @IsBase64() @MaxLength(7000000) fotoBase64?: string;
  @IsNotEmpty() @IsBoolean() lecturaInicial: boolean;
  @IsOptional() @IsNumber() periodoId?: number;
}
