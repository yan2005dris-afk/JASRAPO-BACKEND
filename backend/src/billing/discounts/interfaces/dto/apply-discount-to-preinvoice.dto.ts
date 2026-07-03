import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ApplyDiscountToPreinvoiceDto {
  @ApiProperty({ description: 'ID del descuento del catálogo', example: 1 })
  @IsNumber()
  @Min(1)
  catalogoDescuentoId!: number;

  @ApiPropertyOptional({ description: 'Motivo del descuento manual' })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional({ description: 'Quién autorizó el descuento' })
  @IsOptional()
  @IsString()
  autorizadoPor?: string;

  @ApiPropertyOptional({
    description: 'Monto custom (opcional, si no se usa el valor del catálogo)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoCustom?: number;
}
