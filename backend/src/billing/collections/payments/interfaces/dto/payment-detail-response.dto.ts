import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDetallePago } from 'src/generated/prisma/enums';
import type { PaymentDetailEntity } from '../../domain/entities/payment-detail.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class PaymentDetailComprobanteDto {
  @ApiProperty({ example: '1', description: 'ID del comprobante' })
  comprobanteId: string;

  @ApiProperty({ example: '01', description: 'Tipo de comprobante SRI' })
  tipoComprobante: string;

  @ApiProperty({
    example: '000000123',
    description: 'Secuencial del comprobante',
  })
  secuencial: string;

  @ApiPropertyOptional({
    example: 25.5,
    description: 'Importe total del comprobante',
  })
  importeTotal: number | null;

  @ApiProperty({
    example: 'AUTORIZADO',
    description: 'Estado actual del comprobante',
  })
  estado: string;
}

export class PaymentDetailResponseDto {
  @ApiProperty({ example: '1', description: 'ID del detalle de pago' })
  detallePagoId: string;

  @ApiProperty({ example: '1', description: 'ID del pago padre' })
  pagoId: string;

  @ApiPropertyOptional({
    example: '10',
    description: 'ID del comprobante aplicado',
  })
  comprobanteId: string | null;

  @ApiPropertyOptional({
    example: '3',
    description: 'ID de cuota de convenio aplicada',
  })
  cuotaConvenioId: string | null;

  @ApiProperty({ enum: TipoDetallePago, example: 'COMPROBANTE' })
  tipoPago: TipoDetallePago;

  @ApiProperty({ example: 20.5, description: 'Monto aplicado a este detalle' })
  montoAbonado: number;

  @ApiProperty({ example: 1, description: 'ID de la forma de pago SRI' })
  formaPagoId: number;

  @ApiPropertyOptional({
    example: 'REF-001',
    description: 'Referencia del detalle',
  })
  referencia: string | null;

  @ApiPropertyOptional({
    example: '2026-06-18',
    description: 'Fecha de transacción',
  })
  fechaTransaccion: string | null;

  @ApiProperty({ example: '2026-06-18', description: 'Fecha de creación' })
  fechaCreacion: string;

  @ApiPropertyOptional({ type: PaymentDetailComprobanteDto })
  comprobante?: PaymentDetailComprobanteDto;

  static fromEntity(entity: PaymentDetailEntity): PaymentDetailResponseDto {
    const dto = new PaymentDetailResponseDto();
    dto.detallePagoId = String(entity.detallePagoId);
    dto.pagoId = String(entity.pagoId);
    dto.comprobanteId = entity.comprobanteId
      ? String(entity.comprobanteId)
      : null;
    dto.cuotaConvenioId = entity.cuotaConvenioId
      ? String(entity.cuotaConvenioId)
      : null;
    dto.tipoPago = entity.tipoPago as TipoDetallePago;
    dto.montoAbonado = Number(entity.montoAbonado);
    dto.formaPagoId = entity.formaPagoId;
    dto.referencia = entity.referencia ?? null;
    dto.fechaTransaccion = DateUtil.formatForFrontend(entity.fechaTransaccion);
    dto.fechaCreacion = DateUtil.formatForFrontend(entity.createdAt)!;
    dto.comprobante = entity.comprobante
      ? {
          comprobanteId: entity.comprobante.comprobanteId,
          tipoComprobante: entity.comprobante.tipoComprobante ?? '',
          secuencial: entity.comprobante.secuencial ?? '',
          importeTotal: entity.comprobante.importeTotal ?? null,
          estado: entity.comprobante.estado ?? '',
        }
      : undefined;
    return dto;
  }

  static fromEntityList(
    entities: PaymentDetailEntity[],
  ): PaymentDetailResponseDto[] {
    return entities.map(PaymentDetailResponseDto.fromEntity);
  }
}
