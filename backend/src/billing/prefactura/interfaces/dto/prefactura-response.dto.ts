import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrefacturaDetalleResponseDto {
  @ApiProperty({ description: 'ID del detalle' })
  prefacturaDetalleId: number;

  @ApiProperty({ description: 'Descripción del rubro' })
  descripcion: string;

  @ApiProperty({ description: 'Cantidad' })
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario' })
  precioUnitario: number;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'IVA' })
  iva: number;

  @ApiProperty({ description: 'Total' })
  total: number;

  @ApiPropertyOptional({ description: 'Código de impuesto SRI' })
  codigoImpuestoSri?: string;

  @ApiPropertyOptional({ description: 'Descuento' })
  descuento?: number;
}

export class PrefacturaResponseDto {
  @ApiProperty({ description: 'ID de la prefactura' })
  prefacturaId: number;

  @ApiProperty({ description: 'UUID de la prefactura' })
  uuid: string;

  @ApiProperty({ description: 'ID del contrato' })
  contratoId: number;

  @ApiPropertyOptional({ description: 'ID del lote' })
  loteId?: number;

  @ApiProperty({ description: 'ID del periodo' })
  periodoId: number;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'IVA' })
  iva: number;

  @ApiProperty({ description: 'Descuento total' })
  descuentoTotal: number;

  @ApiProperty({ description: 'Total a pagar' })
  totalPagar: number;

  @ApiPropertyOptional({ description: 'Deuda anterior' })
  deudaAnterior?: number;

  @ApiPropertyOptional({ description: 'Saldo vencido' })
  saldoVencido?: number;

  @ApiPropertyOptional({ description: 'Abono' })
  abono?: number;

  @ApiPropertyOptional({ description: 'Saldo actual' })
  saldoActual?: number;

  @ApiProperty({ description: 'Estado de la prefactura' })
  estado: string;

  @ApiPropertyOptional({ description: 'Nombre del cliente' })
  clienteNombre?: string;

  @ApiPropertyOptional({ description: 'Identificación del cliente' })
  clienteIdentificacion?: string;

  @ApiPropertyOptional({ description: 'Dirección del cliente' })
  clienteDireccion?: string;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  clienteEmail?: string;

  @ApiPropertyOptional({ description: 'Nombre de la tarifa' })
  tarifaNombre?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Detalles de la prefactura' })
  detalles?: PrefacturaDetalleResponseDto[];
}
