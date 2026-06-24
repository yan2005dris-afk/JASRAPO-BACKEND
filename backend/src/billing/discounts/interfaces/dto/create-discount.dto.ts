import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TipoDescuento } from 'src/shared/enums';

export class CreateDiscountDto {
  @ApiProperty({
    description: 'Nombre del descuento',
    example: 'Beneficio Tercera Edad',
  })
  @IsString()
  nombre!: string;

  @ApiPropertyOptional({ description: 'Descripción del descuento' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de descuento',
    enum: TipoDescuento,
    example: TipoDescuento.TERCERA_EDAD,
  })
  @IsEnum(TipoDescuento)
  tipoDescuento!: TipoDescuento;

  @ApiProperty({ description: 'Valor del descuento', example: 50 })
  @IsNumber()
  @Min(0)
  valor!: number;

  @ApiProperty({
    description: 'Indica si el valor es porcentual',
    example: true,
  })
  @IsBoolean()
  esPorcentaje!: boolean;

  @ApiPropertyOptional({ description: 'Rubro al que aplica (opcional)' })
  @IsOptional()
  @IsNumber()
  rubroId?: number;

  @ApiPropertyOptional({
    description: 'Indica si aplica automáticamente',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  aplicaAutomatico?: boolean;
}
