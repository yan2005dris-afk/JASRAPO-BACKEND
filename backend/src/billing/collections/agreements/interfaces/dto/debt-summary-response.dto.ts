import { ApiProperty } from '@nestjs/swagger';

export class PrefacturaDeudaItemDto {
  @ApiProperty({ example: '1', description: 'ID de la prefactura' })
  prefacturaId!: string;

  @ApiProperty({ example: 202501, description: 'ID del período' })
  periodoId!: number;

  @ApiProperty({ example: 45.5, description: 'Total a pagar de la prefactura' })
  totalPagar!: number;

  @ApiProperty({ example: 10.0, description: 'Abono ya realizado' })
  abono!: number;

  @ApiProperty({
    example: 35.5,
    description: 'Saldo pendiente de esta prefactura',
  })
  saldoPendiente!: number;

  @ApiProperty({
    example: 'APROBADA',
    description: 'Estado actual de la prefactura',
  })
  estado!: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Fecha de creación (YYYY-MM-DD)',
  })
  fechaCreacion!: string | null;
}

export class DebtSummaryResponseDto {
  @ApiProperty({ example: '1', description: 'ID del contrato consultado' })
  contratoId!: string;

  @ApiProperty({
    example: 215.75,
    description: 'Suma de saldos pendientes de todas las prefacturas impagadas',
  })
  deudaTotal!: number;

  @ApiProperty({
    example: 45.5,
    description: 'Saldo pendiente del período inmediatamente anterior (periodoId - 1)',
  })
  deudaAnterior!: number;

  @ApiProperty({
    example: 1.5,
    description: 'Tasa de interés mensual vigente (% por mes)',
  })
  tasaMensualVigente!: number;

  @ApiProperty({
    example: 3,
    description: 'Cantidad de períodos con deuda pendiente',
  })
  maxMesesAtrasado!: number;

  @ApiProperty({ example: 5, description: 'Número de prefacturas impagadas' })
  totalPrefacturasImpagadas!: number;

  @ApiProperty({
    type: [PrefacturaDeudaItemDto],
    description: 'Lista de prefacturas impagadas con su saldo pendiente',
  })
  prefacturas!: PrefacturaDeudaItemDto[];
}
