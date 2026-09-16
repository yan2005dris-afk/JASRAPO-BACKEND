import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  EstadoCobranzaContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';

export class FindContractsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de contrato',
    type: String,
  })
  @IsOptional()
  @IsString()
  contratoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de medidor (historial activo)',
    type: String,
  })
  @IsOptional()
  @IsString()
  medidorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por serie del medidor (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  medidorSerie?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de guía (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  numeroGuia?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de categoría tarifa',
    type: String,
  })
  @IsOptional()
  @IsString()
  categoriaTarifaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por dirección de suministro (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiPropertyOptional({ enum: EstadoServicioContrato })
  @IsOptional()
  @IsEnum(EstadoServicioContrato)
  estadoServicio?: EstadoServicioContrato;

  @ApiPropertyOptional({ enum: EstadoCobranzaContrato })
  @IsOptional()
  @IsEnum(EstadoCobranzaContrato)
  estadoCobranza?: EstadoCobranzaContrato;
}
