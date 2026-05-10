import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuotaConvenioResponseDto } from './cuota-convenio-response.dto';

export class ConvenioResponseDto {
  @ApiProperty({ example: '1', description: 'ID del convenio' })
  convenioId: string;

  @ApiProperty({ example: '1', description: 'ID del contrato asociado' })
  contratoId: string;

  @ApiProperty({ example: 6, description: 'Número total de cuotas' })
  numeroCuotas: number;

  @ApiProperty({ example: 50.0, description: 'Abono inicial pagado' })
  abonoInicial: number;

  @ApiProperty({
    example: 215.75,
    description: 'Deuda total al momento de crear el convenio',
  })
  deudaTotal: number;

  @ApiProperty({
    example: 3,
    description: 'Días de mora al momento de crear el convenio',
  })
  diasMoraActual: number;

  @ApiProperty({
    description: 'Estado del convenio',
    example: { estadoConvenioId: 1, codigo: 'ACTIVO', nombre: 'Activo' },
  })
  estado: {
    estadoConvenioId: number;
    codigo: string;
    nombre: string;
  };

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Fecha de aprobación (YYYY-MM-DD)',
  })
  fechaAprobacion: string | null;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Fecha del primer pago (YYYY-MM-DD)',
  })
  fechaPrimerPago: string;

  @ApiPropertyOptional({
    example: '2026-07-01',
    description: 'Fecha del próximo pago (YYYY-MM-DD)',
  })
  fechaProximoPago: string | null;

  @ApiProperty({ example: 0.0, description: 'Monto pagado hasta ahora' })
  montoPagadoActual: number;

  @ApiPropertyOptional({
    example: 'Problemas económicos temporales',
    description: 'Motivo del convenio',
  })
  motivo: string | null;

  @ApiProperty({
    example: '2026-05-10',
    description: 'Fecha de creación (YYYY-MM-DD)',
  })
  fechaCreacion: string;

  @ApiPropertyOptional({
    type: [CuotaConvenioResponseDto],
    description: 'Cuotas generadas para este convenio',
  })
  cuotas?: CuotaConvenioResponseDto[];
}
