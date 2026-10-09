import { ApiProperty } from '@nestjs/swagger';
import { EstadoPeriodo } from 'src/shared/enums';
import type { PeriodRow } from '../../domain/types/period.types';
import { DateUtil } from 'src/shared/utils/date.util';

export class PeriodResponseDto {
  @ApiProperty({ example: 1, description: 'ID del periodo' })
  periodoId: number;

  @ApiProperty({
    example: '2026-01',
    description: 'Nombre o código identificador del periodo',
  })
  nombre: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Fecha de inicio del periodo',
  })
  fechaInicio: string;

  @ApiProperty({
    example: '2026-01-31',
    description: 'Fecha de fin del periodo',
  })
  fechaFin: string;

  @ApiProperty({
    example: '2026-02-15',
    description: 'Fecha de vencimiento del periodo',
  })
  fechaVencimiento: string;

  @ApiProperty({
    enum: EstadoPeriodo,
    example: EstadoPeriodo.ABIERTO,
    description: 'Estado del periodo',
  })
  estado: EstadoPeriodo;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;

  static fromRow(row: PeriodRow): PeriodResponseDto {
    const dto = new PeriodResponseDto();
    dto.periodoId = row.periodoId;
    dto.nombre = row.nombre;
    dto.fechaInicio =
      DateUtil.formatForFrontend(row.fechaInicio) ??
      row.fechaInicio.toISOString().split('T')[0];
    dto.fechaFin =
      DateUtil.formatForFrontend(row.fechaFin) ??
      row.fechaFin.toISOString().split('T')[0];
    dto.fechaVencimiento =
      DateUtil.formatForFrontend(row.fechaVencimiento) ??
      row.fechaVencimiento.toISOString().split('T')[0];
    dto.estado = row.estado;
    dto.createdAt = row.createdAt;
    dto.updatedAt = row.updatedAt;
    return dto;
  }

  static fromRowList(rows: PeriodRow[]): PeriodResponseDto[] {
    return rows.map((row) => PeriodResponseDto.fromRow(row));
  }
}
