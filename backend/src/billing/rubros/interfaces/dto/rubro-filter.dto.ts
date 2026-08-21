import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TipoRubro } from 'src/generated/prisma/client';

export class RubroFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por texto en el nombre del rubro',
    example: 'Agua',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda general por texto (alias de nombre)',
    example: 'Instalación',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de rubro',
    enum: TipoRubro,
  })
  @IsOptional()
  @IsEnum(TipoRubro)
  tipoRubro?: TipoRubro;

  @ApiPropertyOptional({
    description: 'Filtrar por tarifa de impuesto ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tarifaImpuestoId?: number;

  @ApiPropertyOptional({
    description:
      'Filtrar por categoría de tarifa (SC-241). Si se omite, se listan rubros de todas las categorías (incluyendo los sin categoría).',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaTarifaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  activo?: boolean | string;

  @ApiPropertyOptional({
    description: 'Filtrar por si es automático o manual',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  esAutomatico?: boolean | string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de registros por página',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
