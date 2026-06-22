import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoDescuento } from 'src/shared/enums';

export class DiscountFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de descuento',
    enum: TipoDescuento,
  })
  @IsOptional()
  @IsEnum(TipoDescuento)
  tipoDescuento?: TipoDescuento;

  @ApiPropertyOptional({ description: 'Filtrar solo automáticos' })
  @IsOptional()
  @IsBooleanString()
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
  @Max(100)
  limit?: number;
}
