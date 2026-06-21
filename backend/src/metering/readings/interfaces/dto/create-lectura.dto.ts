import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  @IsOptional() @IsString() fotoBase64?: string;
  @IsNotEmpty() @IsBoolean() lecturaInicial: boolean;
  @IsOptional() @IsNumber() periodoId?: number;
}
