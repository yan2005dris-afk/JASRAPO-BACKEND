import { ApiProperty } from '@nestjs/swagger';
import { TipoOrigenAbono } from 'src/generated/prisma/enums';

export class SaldoFavorResponseDto {
  @ApiProperty({ example: '1', description: 'ID del saldo a favor' })
  saldoFavorId: string;

  @ApiProperty({ example: '1', description: 'ID del cliente' })
  clienteId: string;

  @ApiProperty({ example: '5', nullable: true, description: 'Pago que originó el saldo' })
  pagoId: string | null;

  @ApiProperty({ example: 10.25, description: 'Monto disponible del saldo' })
  montoSaldo: number;

  @ApiProperty({ enum: TipoOrigenAbono, example: 'PAGO_EXCESO' })
  tipoOrigen: TipoOrigenAbono;

  @ApiProperty({ example: true, description: 'Indica si se puede aplicar' })
  disponibleParaAplicar: boolean;

  @ApiProperty({ example: '2026-06-18', description: 'Fecha de creación' })
  fechaCreacion: string;
}
