import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { EstadoContrato } from 'src/shared/enums';

export class FilterContractsDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Búsqueda global: número de guía, serie de medidor o dirección de suministro',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de contrato' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  contratoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de guía (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  numeroGuia?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de categoría tarifa' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  categoriaTarifaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de medidor (historial activo)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  medidorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por serie del medidor (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  medidorSerie?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por dirección de suministro (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del contrato',
    enum: EstadoContrato,
  })
  @IsOptional()
  @IsEnum(EstadoContrato)
  estado?: EstadoContrato;
}
