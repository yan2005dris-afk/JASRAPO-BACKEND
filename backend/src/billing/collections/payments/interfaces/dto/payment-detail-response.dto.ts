import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from 'decimal.js';
import type { PaymentDetailRow } from '../../domain/types/payment.types';
import { DateUtil } from 'src/shared/utils/date.util';

export class PaymentDetailPrefacturaNestedDto {
  @ApiProperty({ example: '1', description: 'ID de la prefactura' })
  prefacturaId: string;

  @ApiProperty({ example: 6, description: 'Mes' })
  mes: number;

  @ApiProperty({ example: 100, description: 'Total a pagar' })
  totalPagar: number;

  @ApiProperty({
    example: 10,
    nullable: true,
    description: 'Consumo m3',
  })
  consumoM3: number | null;

  @ApiPropertyOptional({ description: 'Nombre del periodo' })
  periodoNombre?: string;
}

export class PaymentDetailComprobanteDto {
  @ApiProperty({ example: '1', description: 'ID del comprobante' })
  comprobanteId: string;

  @ApiProperty({ example: 'FACTURA', description: 'Tipo de comprobante' })
  tipoComprobante: string;

  @ApiProperty({ example: '001-001-000000001', description: 'Secuencial' })
  secuencial: string;

  @ApiProperty({ example: 100, description: 'Importe total' })
  importeTotal: number | null;

  @ApiProperty({ example: 'AUTORIZADO', description: 'Estado' })
  estado: string;

  @ApiPropertyOptional({ type: PaymentDetailPrefacturaNestedDto })
  prefactura?: PaymentDetailPrefacturaNestedDto;
}

export class PaymentDetailResponseDto {
  @ApiProperty({ example: '1', description: 'ID del detalle de pago' })
  detallePagoId: string;

  @ApiProperty({ example: '1', description: 'ID del pago padre' })
  pagoId: string;

  @ApiPropertyOptional({
    example: '1',
    nullable: true,
    description: 'ID del comprobante',
  })
  comprobanteId?: string | null;

  @ApiPropertyOptional({
    example: '1',
    nullable: true,
    description: 'ID de la cuota de convenio',
  })
  cuotaConvenioId?: string | null;

  @ApiProperty({ example: 'COMPROBANTE', description: 'Tipo de pago' })
  tipoPago: string;

  @ApiProperty({ example: 50, description: 'Monto abonado' })
  montoAbonado: number;

  @ApiProperty({ example: 1, description: 'ID de la forma de pago' })
  formaPagoId: number;

  @ApiPropertyOptional({ description: 'Referencia' })
  referencia?: string | null;

  @ApiPropertyOptional({
    example: '2026-06-18',
    description: 'Fecha de transacción',
  })
  fechaTransaccion: string | null;

  @ApiProperty({ example: '2026-06-18', description: 'Fecha de creación' })
  fechaCreacion: string;

  @ApiPropertyOptional({ type: PaymentDetailComprobanteDto })
  comprobante?: PaymentDetailComprobanteDto;

  static fromRow(entity: PaymentDetailRow): PaymentDetailResponseDto {
    const dto = new PaymentDetailResponseDto();
    dto.detallePagoId = String(entity.detallePagoId);
    dto.pagoId = String(entity.pagoId);
    dto.comprobanteId = entity.comprobanteId
      ? String(entity.comprobanteId)
      : null;
    dto.cuotaConvenioId = entity.cuotaConvenioId
      ? String(entity.cuotaConvenioId)
      : null;
    dto.tipoPago = entity.tipoPago;
    dto.montoAbonado = Number(entity.montoAbonado);
    dto.formaPagoId = entity.formaPagoId;
    dto.referencia = entity.referencia ?? null;
    dto.fechaTransaccion = DateUtil.formatForFrontend(entity.fechaTransaccion);
    dto.fechaCreacion = DateUtil.formatForFrontend(entity.createdAt)!;
    // Cast: `entity.comprobante` puede no existir (cuando la query
    // no lo incluye via el `select` minimo). El cast explicito nos
    // permite acceder a la relation cuando existe, sin que TypeScript
    // se queje de la varianza. Los consumers no acceden a
    // `comprobante.prefactura` aqui.
    const comprobante = (
      entity as unknown as {
        comprobante?: {
          comprobanteId?: bigint | null;
          tipoComprobante?: string | null;
          secuencial?: string | null;
          importeTotal?: Decimal | null;
          estado?: string | null;
          prefactura?: {
            prefacturaId: bigint;
            mes: number;
            totalPagar: Decimal;
            consumoM3: Decimal | null;
            periodoRel?: { nombre: string } | null;
          } | null;
        } | null;
      }
    ).comprobante;
    dto.comprobante = comprobante
      ? {
          comprobanteId: comprobante.comprobanteId
            ? String(comprobante.comprobanteId)
            : '',
          tipoComprobante: comprobante.tipoComprobante ?? '',
          secuencial: comprobante.secuencial ?? '',
          importeTotal:
            comprobante.importeTotal instanceof Decimal
              ? comprobante.importeTotal.toNumber()
              : (comprobante.importeTotal ?? null),
          estado: comprobante.estado ?? '',
          prefactura: comprobante.prefactura
            ? {
                prefacturaId: String(comprobante.prefactura.prefacturaId),
                mes: comprobante.prefactura.mes,
                totalPagar:
                  comprobante.prefactura.totalPagar instanceof Decimal
                    ? comprobante.prefactura.totalPagar.toNumber()
                    : Number(comprobante.prefactura.totalPagar),
                consumoM3:
                  comprobante.prefactura.consumoM3 instanceof Decimal
                    ? comprobante.prefactura.consumoM3.toNumber()
                    : Number(comprobante.prefactura.consumoM3),
                periodoNombre: comprobante.prefactura.periodoRel?.nombre,
              }
            : undefined,
        }
      : undefined;
    return dto;
  }

  static fromRowList(entities: PaymentDetailRow[]): PaymentDetailResponseDto[] {
    return entities.map(PaymentDetailResponseDto.fromRow);
  }
}
