import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CrearLecturaDto {
  @IsNotEmpty() fecha: string;
  @IsNotEmpty() @IsNumber() lecturaAnterior: number;
  @IsNotEmpty() @IsNumber() lecturaActual: number;
  @IsOptional() @IsNumber() consumoCalculado?: number;
  @IsNotEmpty() medidorId: string | number;
  @IsOptional() @IsString() @IsNotEmptyString() descripcionAnomalia?: string;

  @ApiPropertyOptional({
    description:
      'Evidencia fotográfica (solo para uso de Swagger o backward compat si lo mandan en JSON, pero la forma recomendada es adjuntar el archivo multipart)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmptyString()
  fotoUrl?: string;

  @IsNotEmpty() @IsBoolean() lecturaInicial: boolean;
  @IsOptional() @IsNumber() periodoId?: number;
}
