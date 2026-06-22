import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
    enum: [
      'TERCERA_EDAD',
      'DISCAPACIDAD',
      'INTERES_MORA',
      'EXENCION_TASA',
      'CONVENIO',
      'OTROS',
    ],
  })
  @IsEnum([
    'TERCERA_EDAD',
    'DISCAPACIDAD',
    'INTERES_MORA',
    'EXENCION_TASA',
    'CONVENIO',
    'OTROS',
  ])
  tipoDescuento!:
    | 'TERCERA_EDAD'
    | 'DISCAPACIDAD'
    | 'INTERES_MORA'
    | 'EXENCION_TASA'
    | 'CONVENIO'
    | 'OTROS';

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
