import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DiscountFilterDto {
  @ApiPropertyOptional({ description: 'Filtrar por tipo de descuento' })
  @IsOptional()
  @IsEnum([
    'TERCERA_EDAD',
    'DISCAPACIDAD',
    'INTERES_MORA',
    'EXENCION_TASA',
    'CONVENIO',
    'OTROS',
  ])
  tipoDescuento?: string;

  @ApiPropertyOptional({ description: 'Filtrar solo automáticos' })
  @IsOptional()
  aplicaAutomatico?: string;

  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
