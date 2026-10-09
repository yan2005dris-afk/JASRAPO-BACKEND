import { ApiProperty } from '@nestjs/swagger';
import { TipoOrigenAbono } from 'src/generated/prisma/enums';
import type { SaldoFavorEntity } from '../../domain/entities/saldo-favor.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class SaldoFavorResponseDto {
  @ApiProperty({ example: '1', description: 'ID del saldo a favor' })
  saldoFavorId: string;

  @ApiProperty({ example: '1', description: 'ID del cliente' })
  clienteId: string;

  @ApiProperty({
    example: '5',
    nullable: true,
    description: 'Pago que originó el saldo',
  })
  pagoId: string | null;

  @ApiProperty({ example: 10.25, description: 'Monto disponible del saldo' })
  montoSaldo: number;

  @ApiProperty({ enum: TipoOrigenAbono, example: 'PAGO_EXCESO' })
  tipoOrigen: TipoOrigenAbono;

  @ApiProperty({ example: true, description: 'Indica si se puede aplicar' })
  disponibleParaAplicar: boolean;

  @ApiProperty({ example: '2026-06-18', description: 'Fecha de creación' })
  fechaCreacion: string;

  static fromRow(entity: SaldoFavorEntity): SaldoFavorResponseDto {
    const dto = new SaldoFavorResponseDto();
    dto.saldoFavorId = String(entity.saldoFavorId);
    dto.clienteId = String(entity.clienteId);
    dto.pagoId = entity.pagoId ? String(entity.pagoId) : null;
    dto.montoSaldo = Number(entity.montoSaldo);
    dto.tipoOrigen = entity.tipoOrigen as TipoOrigenAbono;
    dto.disponibleParaAplicar = entity.disponibleParaAplicar;
    dto.fechaCreacion = DateUtil.formatForFrontend(entity.createdAt)!;
    return dto;
  }

  static fromRowList(entities: SaldoFavorEntity[]): SaldoFavorResponseDto[] {
    return entities.map(SaldoFavorResponseDto.fromRow);
  }
}
