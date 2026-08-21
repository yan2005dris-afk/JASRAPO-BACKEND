import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoRubro } from 'src/generated/prisma/client';

export class CreateRubroDto {
  @ApiPropertyOptional({
    description: 'Código asignado por el SRI para el rubro/producto',
    example: '001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoSri?: string;

  @ApiProperty({
    description: 'Nombre descriptivo del rubro',
    example: 'Consumo Agua Potable',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(150)
  nombre!: string;

  @ApiProperty({
    description: 'Descripción detallada del rubro',
    example: 'Tarifa mensual por consumo de agua potable por metro cúbico',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  @MaxLength(255)
  descripcion!: string;

  @ApiProperty({
    description: 'Precio unitario base del rubro en USD',
    example: 0.5,
  })
  @IsNumber({}, { message: 'El precio unitario debe ser numérico' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precioUnitario!: number;

  @ApiProperty({
    description: 'Tipo o clasificación del rubro',
    enum: TipoRubro,
    example: TipoRubro.VARIABLE,
  })
  @IsEnum(TipoRubro, {
    message:
      'El tipo de rubro debe ser FIJO, VARIABLE, MULTA, OTRO, BIEN o SERVICIO',
  })
  tipoRubro!: TipoRubro;

  @ApiProperty({
    description: 'ID de la tarifa de impuesto IVA asociada',
    example: 1,
  })
  @IsInt({ message: 'La tarifa de impuesto debe ser un entero' })
  tarifaImpuestoId!: number;

  @ApiPropertyOptional({
    description: 'ID de la categoría tarifaria asociada',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'La categoría tarifaria debe ser un entero' })
  categoriaTarifaId?: number | null;

  @ApiPropertyOptional({
    description: 'Estado de activación del rubro',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el rubro es autogenerado por el sistema',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  esAutomatico?: boolean;
}
