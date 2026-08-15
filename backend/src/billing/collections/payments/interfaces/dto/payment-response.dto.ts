import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Banco, EstadoPago, TarjetaCredito } from 'src/generated/prisma/enums';
import { PaymentDetailResponseDto } from './payment-detail-response.dto';
import { SaldoFavorResponseDto } from './saldo-favor-response.dto';
import type { PaymentEntity } from '../../domain/entities/payment.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class PaymentResponseDto {
  @ApiProperty({ example: '1', description: 'ID del pago' })
  pagoId: string;

  @ApiProperty({ example: '1', description: 'ID del cliente' })
  clienteId: string;

  @ApiPropertyOptional({ example: '1', description: 'ID de la sesión de caja' })
  cajaId: string | null;

  @ApiPropertyOptional({ enum: Banco, example: 'PICHINCHA' })
  banco: Banco | null;

  @ApiPropertyOptional({
    enum: TarjetaCredito,
    example: 'VISA',
    description: 'Marca de tarjeta de crédito/débito',
  })
  tarjetaCredito: TarjetaCredito | null;

  @ApiPropertyOptional({ example: 'comprobante-url.pdf' })
  comprobanteUrl: string | null;

  @ApiProperty({ example: '2026-06-18', description: 'Fecha del pago' })
  fechaPago: string;

  @ApiProperty({ example: 150.5, description: 'Monto total recibido' })
  montoTotalRecibido: number;

  @ApiPropertyOptional({
    example: 'TRX-00123',
    description: 'Número de operación bancaria',
  })
  numeroOperacion: string | null;

  @ApiPropertyOptional({ example: 'Pago mensual' })
  observaciones: string | null;

  @ApiPropertyOptional({
    example: 'REF-BANCO-001',
    description: 'Referencia bancaria adicional',
  })
  referenciaBanco: string | null;

  @ApiProperty({ enum: EstadoPago, example: 'PENDIENTE' })
  estadoPago: EstadoPago;

  @ApiProperty({ example: 'admin@jasrapo.com', description: 'Usuario creador' })
  creadoPor: string;

  @ApiPropertyOptional({ example: 'admin@jasrapo.com', nullable: true })
  anuladoPor: string | null;

  @ApiPropertyOptional({ example: '2026-06-18', nullable: true })
  fechaAnulacion: string | null;

  @ApiPropertyOptional({
    example: 'Transferencia no confirmada',
    nullable: true,
  })
  motivoAnulacion: string | null;

  @ApiProperty({ example: '2026-06-18', description: 'Fecha de creación' })
  fechaCreacion: string;

  @ApiPropertyOptional({ example: '2026-06-18', nullable: true })
  fechaActualizacion: string | null;

  @ApiPropertyOptional({ type: [PaymentDetailResponseDto] })
  detallePago?: PaymentDetailResponseDto[];

  @ApiPropertyOptional({ type: [SaldoFavorResponseDto] })
  saldosFavor?: SaldoFavorResponseDto[];

  static fromEntity(entity: PaymentEntity): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.pagoId = String(entity.pagoId);
    dto.clienteId = String(entity.clienteId);
    dto.cajaId = entity.cajaId ? String(entity.cajaId) : null;
    dto.banco = entity.banco as Banco | null;
    dto.tarjetaCredito = entity.tarjetaCredito as TarjetaCredito | null;
    dto.comprobanteUrl = entity.comprobanteUrl ?? null;
    dto.fechaPago = DateUtil.formatForFrontend(entity.fechaPago)!;
    dto.montoTotalRecibido = Number(entity.montoTotalRecibido);
    dto.numeroOperacion = entity.numeroOperacion ?? null;
    dto.observaciones = entity.observaciones ?? null;
    dto.referenciaBanco = entity.referenciaBanco ?? null;
    dto.estadoPago = entity.estadoPago as EstadoPago;
    dto.creadoPor = entity.creadoPor;
    dto.anuladoPor = entity.anuladoPor ?? null;
    dto.fechaAnulacion = DateUtil.formatForFrontend(entity.fechaAnulacion);
    dto.motivoAnulacion = entity.motivoAnulacion ?? null;
    dto.fechaCreacion = DateUtil.formatForFrontend(entity.createdAt)!;
    dto.fechaActualizacion = DateUtil.formatForFrontend(entity.updatedAt);
    dto.detallePago = entity.detallePago
      ? PaymentDetailResponseDto.fromEntityList(entity.detallePago)
      : undefined;
    dto.saldosFavor = entity.saldosFavor
      ? SaldoFavorResponseDto.fromEntityList(entity.saldosFavor)
      : undefined;
    return dto;
  }

  static fromEntityList(entities: PaymentEntity[]): PaymentResponseDto[] {
    return entities.map(PaymentResponseDto.fromEntity);
  }
}
