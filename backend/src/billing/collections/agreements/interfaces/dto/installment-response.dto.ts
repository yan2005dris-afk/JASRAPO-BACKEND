import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { InstallmentEntity } from '../../domain/entities/installment.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class InstallmentResponseDto {
  @ApiProperty({ example: '1', description: 'ID de la cuota' })
  cuotaConvenioId: string;

  @ApiProperty({ example: '1', description: 'ID del convenio padre' })
  convenioId: string;

  @ApiProperty({ example: 1, description: 'Número secuencial de la cuota' })
  numeroCuota: number;

  @ApiProperty({ example: 27.62, description: 'Valor de la cuota' })
  valorCuota: number;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Fecha de vencimiento (YYYY-MM-DD)',
  })
  fechaVencimiento: string;

  @ApiProperty({
    description: 'Estado de la cuota',
    example: {
      codigo: 'PENDIENTE',
      nombre: 'PENDIENTE',
    },
  })
  estado: {
    codigo: string;
    nombre: string;
  };

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Fecha en que se realizó el pago (YYYY-MM-DD)',
  })
  fechaPago: string | null;

  @ApiProperty({
    example: 0.0,
    description: 'Monto pagado hasta ahora en esta cuota',
  })
  montoPagado: number;

  @ApiProperty({ example: 27.62, description: 'Saldo pendiente de la cuota' })
  saldoPendiente: number;

  @ApiProperty({ example: 0, description: 'Días de retraso si está vencida' })
  diasRetraso: number;

  @ApiProperty({
    example: 0.0,
    description: 'Interés por mora aplicado a esta cuota',
  })
  interesMoraAplicado: number;

  @ApiProperty({
    example: false,
    description: 'Indica si el pago fue completamente cubierto',
  })
  pagoCompleto: boolean;

  @ApiPropertyOptional({
    example: '2026-05-25',
    description: 'Fecha de pago anticipado (YYYY-MM-DD)',
  })
  fechaPagoAnticipado: string | null;

  static fromEntity(cuota: InstallmentEntity): InstallmentResponseDto {
    const dto = new InstallmentResponseDto();
    dto.cuotaConvenioId = String(cuota.cuotaConvenioId);
    dto.convenioId = String(cuota.convenioId);
    dto.numeroCuota = cuota.numeroCuota;
    dto.valorCuota = Number(cuota.valorCuota);
    dto.fechaVencimiento = DateUtil.formatForFrontend(cuota.fechaVencimiento)!;
    dto.estado = {
      codigo: cuota.estado,
      nombre: cuota.estado,
    };
    dto.fechaPago = DateUtil.formatForFrontend(cuota.fechaPago);
    dto.montoPagado = Number(cuota.montoPagado);
    dto.saldoPendiente = Number(cuota.saldoPendiente);
    dto.diasRetraso = cuota.diasRetraso;
    dto.interesMoraAplicado = Number(cuota.interesMoraAplicado);
    dto.pagoCompleto = cuota.pagoCompleto;
    dto.fechaPagoAnticipado = DateUtil.formatForFrontend(
      cuota.fechaPagoAnticipado,
    );
    return dto;
  }

  static fromEntityList(cuotas: InstallmentEntity[]): InstallmentResponseDto[] {
    return cuotas.map(InstallmentResponseDto.fromEntity);
  }
}
