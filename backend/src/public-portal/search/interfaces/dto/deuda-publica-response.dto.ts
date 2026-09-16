import { ApiProperty } from '@nestjs/swagger';
import { EstadoCobranzaContrato } from 'src/shared/enums';

export class ClienteDeudaPublicaDto {
  @ApiProperty({ example: 'Juan Pablo Pérez' })
  nombre!: string;

  @ApiProperty({
    example: '0912345678',
    nullable: true,
    description: 'Número de cédula, RUC o pasaporte del cliente.',
  })
  identificacion!: string | null;
}

export class ContratoDeudaPublicaDto {
  @ApiProperty({ example: '123' })
  contratoId!: string;

  @ApiProperty({ example: '001-001-000001' })
  numeroGuia!: string;

  @ApiProperty({ example: 'ACTIVO' })
  /** @deprecated Compatibility field; use estadoServicio and estadoCobranza. */
  estado!: string;

  @ApiProperty({ example: 'ACTIVO', required: false })
  estadoServicio?: string;

  @ApiProperty({
    enum: EstadoCobranzaContrato,
    example: EstadoCobranzaContrato.AL_DIA,
    required: false,
  })
  estadoCobranza?: EstadoCobranzaContrato;

  @ApiProperty({
    example: 150.0,
    description: 'Suma de saldos pendientes de todas las prefacturas impagadas',
  })
  saldoVencido!: number;

  @ApiProperty({
    example: 45.0,
    description: 'Saldo pendiente del período inmediatamente anterior',
  })
  deudaAnterior!: number;

  @ApiProperty({
    example: 3,
    description: 'Cantidad de períodos con deuda pendiente',
  })
  mesesAtrasado!: number;
}

export class DeudaPublicaResponseDto {
  @ApiProperty({ type: ClienteDeudaPublicaDto })
  cliente!: ClienteDeudaPublicaDto;

  @ApiProperty({ type: [ContratoDeudaPublicaDto] })
  contratos!: ContratoDeudaPublicaDto[];

  @ApiProperty({
    example: 155.0,
    description:
      'Monto total de deuda acumulada en todos los contratos del cliente',
  })
  totalDeuda!: number;
}
