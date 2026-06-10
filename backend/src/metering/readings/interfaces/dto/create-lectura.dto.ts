import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearLecturaDto {
  @IsNotEmpty() fecha: string;
  @IsNotEmpty() @IsNumber() lecturaAnterior: number;
  @IsNotEmpty() @IsNumber() lecturaActual: number;
  @IsOptional() @IsNumber() consumoCalculado?: number;
  @IsNotEmpty() medidorId: string | number;
  @IsOptional() @IsString() descripcionAnomalia?: string;
  @IsOptional() @IsString() fotoUrlMinIo?: string;
  @IsNotEmpty() @IsBoolean() lecturaInicial: boolean;
  @IsNotEmpty() @IsNumber() periodoId: number;
}
