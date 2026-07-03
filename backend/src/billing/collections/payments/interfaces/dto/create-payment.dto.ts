import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  Banco,
  TarjetaCredito,
  TipoDetallePago,
} from 'src/generated/prisma/enums';

export class CreateDetallePagoDto {
  @ApiPropertyOptional({ example: '1', description: 'ID del comprobante' })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'comprobanteId debe ser un ID numérico' })
  comprobanteId?: string;

  @ApiPropertyOptional({ example: '1', description: 'ID de cuota de convenio' })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'cuotaConvenioId debe ser un ID numérico' })
  cuotaConvenioId?: string;

  @ApiProperty({ enum: TipoDetallePago, example: 'COMPROBANTE' })
  @IsEnum(TipoDetallePago)
  tipoPago: TipoDetallePago;

  @ApiProperty({ example: 100.0, minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  montoAbonado: number;

  @ApiProperty({ example: 1, description: 'ID de forma de pago SRI' })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  formaPagoId: number;

  @ApiPropertyOptional({ example: 'REF-001' })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiPropertyOptional({ example: '2026-06-18' })
  @IsOptional()
  @IsDateString()
  fechaTransaccion?: string;
}

export class CreatePaymentDto {
  @ApiProperty({ example: '1', description: 'ID del cliente que paga' })
  @Matches(/^\d+$/, { message: 'clienteId debe ser un ID numérico' })
  @IsNotEmpty()
  clienteId: string;

  @ApiPropertyOptional({
    example: '12345',
    description: 'ID de sesión de caja',
  })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'cajaId debe ser un ID numérico' })
  cajaId?: string;

  @ApiPropertyOptional({
    enum: Banco,
    example: 'PICHINCHA',
    description: 'Banco de origen (solo para transferencias bancarias)',
  })
  @ValidateIf((o) => o.tarjetaCredito !== undefined)
  @IsEmpty({
    message: 'No puede enviar banco y tarjetaCredito simultáneamente',
  })
  @IsOptional()
  @IsEnum(Banco)
  banco?: Banco;

  @ApiPropertyOptional({
    enum: TarjetaCredito,
    example: 'VISA',
    description: 'Marca de tarjeta (solo para pagos con tarjeta)',
  })
  @ValidateIf((o) => o.banco !== undefined)
  @IsEmpty({
    message: 'No puede enviar banco y tarjetaCredito simultáneamente',
  })
  @IsOptional()
  @IsEnum(TarjetaCredito)
  tarjetaCredito?: TarjetaCredito;

  @ApiProperty({ example: '2026-06-18' })
  @IsDateString()
  fechaPago: string;

  @ApiProperty({ example: 150.5, minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  montoTotalRecibido: number;

  @ApiPropertyOptional({
    example: 'TRX-00123',
    description: 'Número de operación bancaria',
  })
  @IsOptional()
  @IsString()
  numeroOperacion?: string;

  @ApiPropertyOptional({ example: 'Pago mensual' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    example: 'REF-BANCO-001',
    description: 'Referencia bancaria adicional',
  })
  @IsOptional()
  @IsString()
  referenciaBanco?: string;

  @ApiPropertyOptional({ example: 'comprobante-url.pdf' })
  @IsOptional()
  @IsString()
  comprobanteUrl?: string;

  @ApiProperty({
    type: [CreateDetallePagoDto],
    description: 'Detalle de aplicación del pago',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetallePagoDto)
  detalle: CreateDetallePagoDto[];
}

export class ApplySaldoFavorDto {
  @ApiProperty({ example: '1', description: 'ID del saldo a favor disponible' })
  @Matches(/^\d+$/, { message: 'saldoFavorId debe ser un ID numérico' })
  @IsNotEmpty()
  saldoFavorId: string;

  @ApiProperty({ example: '1', description: 'ID del cliente' })
  @Matches(/^\d+$/, { message: 'clienteId debe ser un ID numérico' })
  @IsNotEmpty()
  clienteId: string;

  @ApiProperty({ example: 10.25, minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  montoAplicar: number;

  @ApiPropertyOptional({ example: '10', description: 'Comprobante destino' })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'comprobanteId debe ser un ID numérico' })
  comprobanteId?: string;

  @ApiPropertyOptional({
    example: '3',
    description: 'Cuota de convenio destino',
  })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'cuotaConvenioId debe ser un ID numérico' })
  cuotaConvenioId?: string;

  @ApiProperty({ example: 1, description: 'ID de forma de pago SRI' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  formaPagoId: number;

  @ApiPropertyOptional({ example: 'Aplicación de saldo a favor' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
