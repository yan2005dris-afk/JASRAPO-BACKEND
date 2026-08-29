import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class ActualizarLecturaDto {
  @IsOptional() @IsDateString() fecha?: string | Date;
  @IsOptional() @IsNumber() lecturaAnterior?: number;
  @IsOptional() @IsNumber() lecturaActual?: number;
  @IsOptional() @IsNumber() consumoCalculado?: number;
  @IsOptional() medidorId?: string | number | bigint;
  @IsOptional() @IsString() @IsNotEmptyString() descripcionAnomalia?: string;
  @IsOptional() @IsBoolean() lecturaInicial?: boolean;
  @IsOptional() @IsNumber() periodoId?: number;
  @IsOptional() @IsString() estado?: string;
}
