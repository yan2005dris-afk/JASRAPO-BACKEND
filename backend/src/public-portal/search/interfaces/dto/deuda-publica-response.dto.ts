import { ApiProperty } from '@nestjs/swagger';

export class ClienteDeudaPublicaDto {
  @ApiProperty({ example: 'Juan Pablo Pérez' })
  nombre!: string;

  @ApiProperty({
    example: '0912345678',
    nullable: true,
    description:
      'Cédula/RUC del cliente. Se enmascara (ej. "091****678") cuando la búsqueda se hizo por tipo=nombre, ya que ese modo no prueba identidad.',
  })
  identificacion!: string | null;
}

export class ContratoDeudaPublicaDto {
  @ApiProperty({ example: '123' })
  contratoId!: string;

  @ApiProperty({ example: '001-001-000001' })
  numeroGuia!: string;

  @ApiProperty({ example: 'ACTIVO' })
  estado!: string;

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

export class DeudaPublicaItemDto {
  @ApiProperty({ type: ClienteDeudaPublicaDto })
  cliente!: ClienteDeudaPublicaDto;

  @ApiProperty({ type: [ContratoDeudaPublicaDto] })
  contratos!: ContratoDeudaPublicaDto[];
}

export class DeudaPublicaResponseDto {
  @ApiProperty({ type: [DeudaPublicaItemDto] })
  data!: DeudaPublicaItemDto[];

  @ApiProperty({ example: { total: 1, page: 1, limit: 10 } })
  meta!: { total: number; page: number; limit: number };
}
