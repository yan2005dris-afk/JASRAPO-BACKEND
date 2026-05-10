import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CuotaConvenioResponseDto {
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
      estadoCuotaConvenioId: 1,
      codigo: 'PENDIENTE',
      nombre: 'Pendiente',
    },
  })
  estado: {
    estadoCuotaConvenioId: number;
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
}
