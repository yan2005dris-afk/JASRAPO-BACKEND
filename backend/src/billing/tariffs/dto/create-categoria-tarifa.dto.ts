import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoriaTarifaDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valorBase?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  consumoMinimoMensual?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valorExcedenteM3?: number;
}
