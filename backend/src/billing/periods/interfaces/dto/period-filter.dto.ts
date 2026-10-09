import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EstadoPeriodo } from 'src/shared/enums';

export class PeriodFilterDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda para filtrar por nombre',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre exacto o parcial',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    enum: EstadoPeriodo,
    description: 'Filtrar por estado del periodo',
  })
  @IsOptional()
  @IsEnum(EstadoPeriodo)
  estado?: EstadoPeriodo;

  @ApiPropertyOptional({
    description: 'Filtrar fecha de inicio desde (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  fechaInicioDesde?: string;

  @ApiPropertyOptional({
    description: 'Filtrar fecha de inicio hasta (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  fechaInicioHasta?: string;
}
