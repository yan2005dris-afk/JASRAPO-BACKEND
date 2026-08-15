import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ReadingWithAnomalies } from '../../domain/repositories/repository-types';

export class OperatorAnomaliaDto {
  @ApiProperty({ description: 'Tipo de anomalía', example: 'LECTURA_ATIPICA' })
  tipo: string;

  @ApiPropertyOptional({ description: 'Observación', example: 'Lectura no registrada' })
  observacion: string | null;

  @ApiProperty({ description: 'Estado de la anomalía', example: 'PENDIENTE' })
  estado: string;
}

export class OperatorReadingAnomalyResponseDto {
  @ApiPropertyOptional({ description: 'ID de la lectura', example: '42' })
  lecturaId: string | null;

  @ApiPropertyOptional({ description: 'ID del medidor', example: '7' })
  medidorId: string | null;

  @ApiProperty({ description: 'Serie del medidor', example: 'MED-001' })
  medidorSerie: string;

  @ApiPropertyOptional({ description: 'Fecha de la lectura' })
  fecha?: Date;

  @ApiProperty({ description: 'Estado de la lectura', example: 'CON_NOVEDAD' })
  estado: string;

  @ApiProperty({
    description: 'Anomalías pendientes de la lectura',
    type: [OperatorAnomaliaDto],
  })
  anomalias: OperatorAnomaliaDto[];

  constructor(partial: Partial<OperatorReadingAnomalyResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(reading: ReadingWithAnomalies): OperatorReadingAnomalyResponseDto {
    return new OperatorReadingAnomalyResponseDto({
      lecturaId: reading.lecturaId?.toString() ?? null,
      medidorId: reading.medidor?.medidorId?.toString() ?? null,
      medidorSerie: reading.medidor?.serie ?? '',
      fecha: reading.fecha,
      estado: reading.estado,
      anomalias: (reading.lecturaAnomalias ?? []).map((a) => ({
        tipo: a.tipo,
        observacion: a.observacion,
        estado: a.estado,
      })),
    });
  }
}