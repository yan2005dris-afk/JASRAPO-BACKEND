import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CreateCategoriaTarifaDto {
  @IsString()
  @IsNotEmptyString()
  nombre!: string;

  @IsOptional()
  @IsString()
  @IsNotEmptyString()
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

  /**
   * ID de la tarifa de impuesto (CatalogoTarifasImpuesto) que se asigna a
   * los 3 Rubros auto-creados. Si no se pasa, se usa la primera activa.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tarifaImpuestoId?: number;
}
