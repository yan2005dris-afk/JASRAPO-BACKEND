import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { TipoAnomalia, EstadoAnomalia } from 'src/shared/enums';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReadingAnomalyFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de lectura',
    example: '1',
  })
  @IsOptional()
  @IsString()
  lecturaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de anomalía',
    enum: TipoAnomalia,
    example: 'FUGA',
  })
  @IsOptional()
  @IsEnum(TipoAnomalia)
  tipo?: TipoAnomalia;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de anomalía',
    enum: EstadoAnomalia,
    example: 'PENDIENTE',
  })
  @IsOptional()
  @IsEnum(EstadoAnomalia)
  estado?: EstadoAnomalia;
}

export class ResponseReadingAnomalyDto {
  @ApiProperty({ description: 'ID de la anomalía' })
  anomaliaId: string;

  @ApiProperty({ description: 'ID de la lectura asociada' })
  lecturaId: string;

  @ApiProperty({ description: 'Observación de la anomalía', required: false })
  observacion: string | null;

  @ApiProperty({ description: 'Tipo de anomalía' })
  tipo: string;

  @ApiProperty({ description: 'Estado de la anomalía' })
  estado: string;

  @ApiProperty({ description: 'URL de la foto', required: false })
  fotoUrl: string | null;

  @ApiProperty({ description: 'Lectura asociada', required: false })
  lectura?: {
    lecturaId: string;
    fecha: Date;
    lecturaActual: number;
    consumoCalculado: number;
  } | null;

  constructor(partial: Partial<ResponseReadingAnomalyDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(
    anomaly: ReadingAnomalyEntity | null | undefined,
  ): ResponseReadingAnomalyDto | null {
    if (!anomaly) return null;
    return new ResponseReadingAnomalyDto({
      anomaliaId: anomaly.anomaliaId.toString(),
      lecturaId: anomaly.lecturaId.toString(),
      observacion: anomaly.observacion,
      tipo: anomaly.tipo,
      estado: anomaly.estado,
      fotoUrl: anomaly.fotoUrl,
      lectura: anomaly.lectura
        ? {
            lecturaId: anomaly.lectura.lecturaId.toString(),
            fecha: anomaly.lectura.fecha,
            lecturaActual: anomaly.lectura.lecturaActual,
            consumoCalculado: anomaly.lectura.consumoCalculado,
          }
        : null,
    });
  }
}
