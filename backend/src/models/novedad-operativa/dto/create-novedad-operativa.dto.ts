import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/client';

export class CrearNovedadOperativaDto {
  @IsNotEmpty() lecturaId: string | number;
  @IsOptional() @IsString() observacion?: string;
  @IsNotEmpty() @IsEnum(TipoNovedad) tipo: TipoNovedad;
  @IsNotEmpty() @IsEnum(EstadoNovedad) estado: EstadoNovedad;
}
