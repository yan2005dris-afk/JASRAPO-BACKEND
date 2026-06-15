import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

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
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    return value === 'true' || value === true;
  })
  activo?: boolean;
}
