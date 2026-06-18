import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDetallePago } from 'src/generated/prisma/enums';

export class PaymentDetailComprobanteDto {
  @ApiProperty({ example: '1', description: 'ID del comprobante' })
  comprobanteId: string;

  @ApiProperty({ example: '01', description: 'Tipo de comprobante SRI' })
  tipoComprobante: string;

  @ApiProperty({ example: '000000123', description: 'Secuencial del comprobante' })
  secuencial: string;

  @ApiPropertyOptional({ example: 25.5, description: 'Importe total del comprobante' })
  importeTotal: number | null;

  @ApiProperty({ example: 'AUTORIZADO', description: 'Estado actual del comprobante' })
  estado: string;
}

export class PaymentDetailResponseDto {
  @ApiProperty({ example: '1', description: 'ID del detalle de pago' })
  detallePagoId: string;

  @ApiProperty({ example: '1', description: 'ID del pago padre' })
  pagoId: string;

  @ApiPropertyOptional({ example: '10', description: 'ID del comprobante aplicado' })
  comprobanteId: string | null;

  @ApiPropertyOptional({ example: '3', description: 'ID de cuota de convenio aplicada' })
  cuotaConvenioId: string | null;

  @ApiProperty({ enum: TipoDetallePago, example: 'COMPROBANTE' })
  tipoPago: TipoDetallePago;

  @ApiProperty({ example: 20.5, description: 'Monto aplicado a este detalle' })
  montoAbonado: number;

  @ApiProperty({ example: 1, description: 'ID de la forma de pago SRI' })
  formaPagoId: number;

  @ApiPropertyOptional({ example: 'REF-001', description: 'Referencia del detalle' })
  referencia: string | null;

  @ApiPropertyOptional({ example: '2026-06-18', description: 'Fecha de transacción' })
  fechaTransaccion: string | null;

  @ApiProperty({ example: '2026-06-18', description: 'Fecha de creación' })
  fechaCreacion: string;

  @ApiPropertyOptional({ type: PaymentDetailComprobanteDto })
  comprobante?: PaymentDetailComprobanteDto;
}
