import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CrearLecturaDto {
  @IsNotEmpty() fecha: string;
  @IsNotEmpty() @IsNumber() lecturaAnterior: number;
  @IsNotEmpty() @IsNumber() lecturaActual: number;
  @IsOptional() @IsNumber() consumoCalculado?: number; 
  @IsNotEmpty() contratoId: string | number;
  @IsOptional() @IsString() descripcionAnomalia?: string;
  @IsOptional() @IsString() fotoUrlMinIo?: string; 
  @IsOptional() @IsBoolean() isValidada?: boolean; 
  @IsNotEmpty() @IsBoolean() lecturaInicial: boolean;
  @IsNotEmpty() @IsString() periodo: string;
  @IsOptional() @IsBoolean() tieneAnomalia?: boolean; 
}