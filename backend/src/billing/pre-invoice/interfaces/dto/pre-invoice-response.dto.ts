import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';
import type { PreInvoiceDetailEntity } from '../../domain/entities/pre-invoice-detail.entity';

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
  codigoImpuestoSri?: string | null;

  @ApiPropertyOptional({
    description: 'Internal system code for the line item',
    example: 'INSTALACION',
    nullable: true,
  })
  codigoSistemaRubro?: string | null;

  @ApiPropertyOptional({ description: 'Discount' })
  descuento?: number;

  static fromRow(detail: PreInvoiceDetailEntity): PreInvoiceDetailResponseDto {
    const dto = new PreInvoiceDetailResponseDto();
    dto.prefacturaDetalleId = detail.prefacturaDetalleId;
    dto.descripcion = detail.descripcion;
    dto.cantidad = Number(detail.cantidad);
    dto.precioUnitario = Number(detail.precioUnitario);
    dto.subtotal = Number(detail.subtotal);
    dto.iva = Number(detail.iva);
    dto.total = Number(detail.total);
    dto.codigoImpuestoSri = detail.codigoImpuestoSri ?? null;
    dto.codigoSistemaRubro = detail.codigoSistemaRubro ?? null;
    dto.descuento = Number(detail.descuento);
    return dto;
  }
}

export class PreInvoiceResponseDto {
  @ApiProperty({ description: 'Pre-invoice ID' })
  prefacturaId: number;

  @ApiProperty({ description: 'Pre-invoice UUID' })
  uuid: string;

  @ApiProperty({ description: 'Contract ID' })
  contratoId: number;

  @ApiPropertyOptional({ description: 'Número de guía del contrato' })
  numeroGuia?: string | null;

  @ApiPropertyOptional({ description: 'Batch ID' })
  loteId?: number | null;

  @ApiProperty({ description: 'Period ID' })
  periodoId: number;

  @ApiProperty({
    description: 'Month (0 for one-off installation, 1-12 for monthly)',
  })
  mes: number;

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
  clienteNombre?: string | null;

  @ApiPropertyOptional({ description: 'Client identification' })
  clienteIdentificacion?: string | null;

  @ApiPropertyOptional({ description: 'Client address' })
  clienteDireccion?: string | null;

  @ApiPropertyOptional({ description: 'Client email' })
  clienteEmail?: string | null;

  @ApiPropertyOptional({ description: 'Period name' })
  periodoNombre?: string | null;

  @ApiPropertyOptional({ description: 'Period start date' })
  periodoFechaInicio?: Date | null;

  @ApiPropertyOptional({ description: 'Period end date' })
  periodoFechaFin?: Date | null;

  @ApiPropertyOptional({ description: 'Tariff name' })
  tarifaNombre?: string | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Pre-invoice details' })
  detalles?: PreInvoiceDetailResponseDto[];

  @ApiPropertyOptional({ description: 'Comprobante ID' })
  comprobanteId?: string | null;

  static fromRow(entity: PreInvoiceEntity): PreInvoiceResponseDto {
    const dto = new PreInvoiceResponseDto();
    dto.prefacturaId = Number(entity.prefacturaId);
    dto.uuid = entity.uuid;
    dto.contratoId = Number(entity.contratoId);
    dto.numeroGuia = entity.contrato?.numeroGuia ?? null;
    dto.loteId = entity.loteId ? Number(entity.loteId) : null;
    dto.periodoId = entity.periodoId;
    dto.mes = entity.mes ?? 1;
    dto.subtotal = Number(entity.subtotal);
    dto.iva = Number(entity.iva);
    dto.descuentoTotal = Number(entity.descuentoTotal);
    dto.totalPagar = Number(entity.totalPagar);
    dto.deudaAnterior = Number(entity.deudaAnterior);
    dto.saldoVencido = Number(entity.saldoVencido);
    dto.abono = Number(entity.abono);
    dto.saldoActual = Number(entity.saldoActual);
    dto.estado = entity.estado;
    dto.clienteNombre = entity.clienteNombre ?? null;
    dto.clienteIdentificacion = entity.clienteIdentificacion ?? null;
    dto.clienteDireccion = entity.clienteDireccion ?? null;
    dto.clienteEmail = entity.clienteEmail ?? null;
    dto.periodoNombre = entity.periodoRel?.nombre ?? null;
    dto.periodoFechaInicio = entity.periodoRel?.fechaInicio ?? null;
    dto.periodoFechaFin = entity.periodoRel?.fechaFin ?? null;
    dto.tarifaNombre = entity.tarifaNombre ?? null;
    dto.comprobanteId = entity.comprobanteId
      ? String(entity.comprobanteId)
      : null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.detalles = entity.detalles?.map(PreInvoiceDetailResponseDto.fromRow);
    return dto;
  }

  static fromRowList(entities: PreInvoiceEntity[]): PreInvoiceResponseDto[] {
    return entities.map(PreInvoiceResponseDto.fromRow);
  }
}
