import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidDateRange } from 'src/infrastructure/common/decorators/is-valid-date-range.decorator';

export class ClientsListReportFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por identificación (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  identificacion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombres (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  nombres?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por apellidos (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  apellidos?: string;

  @ApiPropertyOptional({ description: 'Búsqueda por nombre completo' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  nombreCompleto?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo activos (true) o inactivos (false)',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  activo?: boolean | string;

  @ApiPropertyOptional({
    description: 'Clientes ingresados desde esta fecha (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @IsValidDateRange()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Clientes ingresados hasta esta fecha (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaHasta?: string;
}
