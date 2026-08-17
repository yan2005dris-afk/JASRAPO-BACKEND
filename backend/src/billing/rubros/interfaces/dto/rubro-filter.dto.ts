import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
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
    description: 'Filtrar por estado activo/inactivo',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por si es automático o manual',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esAutomatico?: boolean;

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
