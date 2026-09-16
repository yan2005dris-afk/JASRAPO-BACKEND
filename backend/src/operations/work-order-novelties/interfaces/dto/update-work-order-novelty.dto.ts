import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  TipoAnomalia,
  EstadoNovedad,
  ResolucionEconomicaAnomalia,
} from 'src/shared/enums';

export class UpdateWorkOrderNoveltyDto {
  @ApiPropertyOptional({ description: 'Observación descriptiva' })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({ enum: TipoAnomalia })
  @IsOptional()
  @IsEnum(TipoAnomalia)
  tipo?: TipoAnomalia;

  @ApiPropertyOptional({ enum: EstadoNovedad })
  @IsOptional()
  @IsEnum(EstadoNovedad)
  estado?: EstadoNovedad;

  @ApiPropertyOptional({ enum: ResolucionEconomicaAnomalia })
  @IsOptional()
  @IsEnum(ResolucionEconomicaAnomalia)
  resolucionTipo?: ResolucionEconomicaAnomalia;

  @ApiPropertyOptional({
    description: 'Consumo ajustado para resolución económica',
  })
  @IsOptional()
  @IsNumber()
  consumoAjustado?: number;

  @ApiPropertyOptional({ description: 'Observación de la resolución' })
  @IsOptional()
  @IsString()
  observacionResolucion?: string;
}
