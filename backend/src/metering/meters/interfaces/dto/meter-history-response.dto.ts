import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateUtil } from 'src/shared/utils/date.util';
import type { MeterHistoryRow } from '../../infrastructure/repositories/meter.include';

export class MeterHistoryResponseDto {
  @ApiProperty({ example: '10' })
  historialId: string;

  @ApiProperty({ example: '3' })
  medidorId: string;

  @ApiProperty({ example: 'MED-001' })
  serie: string;

  @ApiProperty({ example: 'Elster' })
  marca: string;

  @ApiProperty({ example: 'V100' })
  modelo: string;

  @ApiProperty({ example: '1' })
  contratoId: string;

  @ApiPropertyOptional({ example: 'Juan Perez', nullable: true })
  clienteNombre: string | null;

  @ApiProperty({ example: '2026-01-15' })
  fechaDesde: string;

  @ApiPropertyOptional({ example: '2026-06-15', nullable: true })
  fechaHasta: string | null;

  @ApiProperty({ example: 120 })
  lecturaInicial: number;

  @ApiPropertyOptional({ example: 350, nullable: true })
  lecturaFinal: number | null;

  @ApiPropertyOptional({ example: 'DANO', nullable: true })
  motivo: string | null;

  @ApiPropertyOptional({ nullable: true })
  observacion: string | null;

  @ApiPropertyOptional({ example: 0, nullable: true })
  saldoPendienteCambio: number | null;

  @ApiPropertyOptional({ example: '5', nullable: true })
  reemplazoSalienteId: string | null;

  @ApiPropertyOptional({ example: '6', nullable: true })
  reemplazoEntranteId: string | null;

  @ApiProperty({ example: true })
  esReemplazo: boolean;

  constructor(partial: Partial<MeterHistoryResponseDto>) {
    Object.assign(this, partial);
  }

  static fromRow(e: MeterHistoryRow): MeterHistoryResponseDto {
    const cliente = e.contrato?.cliente;
    const clienteNombre = cliente
      ? cliente.razonSocial?.trim() ||
        [cliente.nombres, cliente.apellidos]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(' ') ||
        null
      : null;

    const reemplazoSalienteId =
      e.reemplazosSaliente?.reemplazoId?.toString() ?? null;
    const reemplazoEntranteId =
      e.reemplazosEntrante?.reemplazoId?.toString() ?? null;

    return new MeterHistoryResponseDto({
      historialId: e.historialId.toString(),
      medidorId: e.medidorId.toString(),
      serie: e.medidor?.serie ?? '',
      marca: e.medidor?.marca ?? '',
      modelo: e.medidor?.modelo ?? '',
      contratoId: e.contratoId.toString(),
      clienteNombre,
      fechaDesde: DateUtil.formatForFrontend(e.fechaDesde) ?? '',
      fechaHasta: DateUtil.formatForFrontend(e.fechaHasta),
      lecturaInicial: Number(e.lecturaInicial),
      lecturaFinal: e.lecturaFinal != null ? Number(e.lecturaFinal) : null,
      motivo: e.motivo ?? null,
      observacion: e.observacion ?? null,
      saldoPendienteCambio:
        e.saldoPendienteCambio != null ? Number(e.saldoPendienteCambio) : null,
      reemplazoSalienteId,
      reemplazoEntranteId,
      esReemplazo: reemplazoSalienteId != null || reemplazoEntranteId != null,
    });
  }
}
