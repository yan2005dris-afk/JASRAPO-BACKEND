import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCategoriaTarifaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  valorBase?: number;

  @IsOptional()
  @IsNumber()
  consumoMinimoMensual?: number;

  @IsOptional()
  @IsNumber()
  valorExcedenteM3?: number;
}
