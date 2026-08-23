import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OpenCashSessionDto {
  @ApiProperty({
    description: 'Fondo de caja o monto de apertura',
    example: 20.0,
  })
  @IsNumber()
  @IsNotEmpty()
  montoApertura: number;
}

export class CreateCashMovementDto {
  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: ['EGRESO', 'INGRESO_EXTRA'],
    example: 'EGRESO',
  })
  @IsEnum(['EGRESO', 'INGRESO_EXTRA'])
  @IsNotEmpty()
  tipoMovimiento: 'EGRESO' | 'INGRESO_EXTRA';

  @ApiProperty({ description: 'Monto del gasto o ingreso extra', example: 5.0 })
  @IsNumber()
  @IsNotEmpty()
  monto: number;

  @ApiProperty({
    description: 'Motivo o justificación del movimiento',
    example: 'Pasajes de mensajería y trámites',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiPropertyOptional({
    description: 'Referencia o número de comprobante/recibo',
    example: 'REC-0012',
  })
  @IsString()
  @IsOptional()
  comprobanteRef?: string;
}

export class ArqueoDetalleItemDto {
  @ApiProperty({
    description: 'Denominación monetaria (ej: 20.00, 0.50)',
    example: 20.0,
  })
  @IsNumber()
  @IsNotEmpty()
  denominacion: number;

  @ApiProperty({ description: 'Cantidad física contada', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @ApiProperty({ description: 'Indica si es moneda o billete', example: false })
  @IsOptional()
  esMoneda?: boolean;
}

export class CloseCashSessionDto {
  @ApiPropertyOptional({
    description: 'Total de transferencias declaradas',
    example: 45.0,
  })
  @IsNumber()
  @IsOptional()
  totalTransferenciasDeclaradas?: number;

  @ApiPropertyOptional({
    description: 'Novedades u observaciones del cierre',
    example: 'Cierre de turno normal',
  })
  @IsString()
  @IsOptional()
  novedadCierre?: string;

  @ApiProperty({
    description: 'Desglose del conteo físico de billetes y monedas',
    type: [ArqueoDetalleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArqueoDetalleItemDto)
  arqueo: ArqueoDetalleItemDto[];
}
