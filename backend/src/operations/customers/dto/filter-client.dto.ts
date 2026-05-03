import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterClientDto {
  @ApiPropertyOptional({
    description: 'Filtrar por número de identificación',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  identificacion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombres (búsqueda parcial)',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por apellidos (búsqueda parcial)',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString()
  apellidos?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre completo (búsqueda parcial)',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo (true=activos, false=inactivos)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
