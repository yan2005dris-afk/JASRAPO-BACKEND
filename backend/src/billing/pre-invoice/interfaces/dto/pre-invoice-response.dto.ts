import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PreInvoiceDetailResponseDto {
  @ApiProperty({ description: 'Detail ID' })
  prefacturaDetalleId: number;

  @ApiProperty({ description: 'Line item description' })
  descripcion: string;

  @ApiProperty({ description: 'Quantity' })
  cantidad: number;

  @ApiProperty({ description: 'Unit price' })
  precioUnitario: number;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'Tax' })
  iva: number;

  @ApiProperty({ description: 'Total' })
  total: number;

  @ApiPropertyOptional({ description: 'SRI tax code' })
  codigoImpuestoSri?: string;

  @ApiPropertyOptional({ description: 'Discount' })
  descuento?: number;
}

export class PreInvoiceResponseDto {
  @ApiProperty({ description: 'Pre-invoice ID' })
  prefacturaId: number;

  @ApiProperty({ description: 'Pre-invoice UUID' })
  uuid: string;

  @ApiProperty({ description: 'Contract ID' })
  contratoId: number;

  @ApiPropertyOptional({ description: 'Batch ID' })
  loteId?: number;

  @ApiProperty({ description: 'Period ID' })
  periodoId: number;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'Tax' })
  iva: number;

  @ApiProperty({ description: 'Total discount' })
  descuentoTotal: number;

  @ApiProperty({ description: 'Total to pay' })
  totalPagar: number;

  @ApiPropertyOptional({ description: 'Previous debt' })
  deudaAnterior?: number;

  @ApiPropertyOptional({ description: 'Overdue balance' })
  saldoVencido?: number;

  @ApiPropertyOptional({ description: 'Payment' })
  abono?: number;

  @ApiPropertyOptional({ description: 'Current balance' })
  saldoActual?: number;

  @ApiProperty({ description: 'Pre-invoice status' })
  estado: string;

  @ApiPropertyOptional({ description: 'Client name' })
  clienteNombre?: string;

  @ApiPropertyOptional({ description: 'Client identification' })
  clienteIdentificacion?: string;

  @ApiPropertyOptional({ description: 'Client address' })
  clienteDireccion?: string;

  @ApiPropertyOptional({ description: 'Client email' })
  clienteEmail?: string;

  @ApiPropertyOptional({ description: 'Tariff name' })
  tarifaNombre?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Pre-invoice details' })
  detalles?: PreInvoiceDetailResponseDto[];
}
