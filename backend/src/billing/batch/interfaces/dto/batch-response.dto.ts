import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BatchRow } from '../../domain/types/batch.types';
import { PreInvoiceResponseDto } from '../../../pre-invoice/interfaces/dto/pre-invoice-response.dto';

export class BatchCommunityResponseDto {
  @ApiProperty({ description: 'Community ID' })
  comunidadId: number;

  @ApiProperty({ description: 'Community name' })
  nombre: string;
}

export class BatchPeriodoResponseDto {
  @ApiProperty({ description: 'Period ID' })
  periodoId: number;

  @ApiProperty({ description: 'Period name' })
  nombre: string;

  @ApiPropertyOptional({ description: 'Start date' })
  fechaInicio?: Date | null;

  @ApiPropertyOptional({ description: 'End date' })
  fechaFin?: Date | null;
}

export class BatchRutaResponseDto {
  @ApiProperty({ description: 'Work route ID' })
  rutaId: number;

  @ApiPropertyOptional({ description: 'Work route name' })
  nombre?: string | null;
}

export class BatchGenerationResponseDto {
  @ApiProperty({
    description: 'Operation status message',
    example: 'Batch generated successfully',
  })
  message: string;

  @ApiPropertyOptional({ description: 'Generated batch ID', example: 1 })
  batchId?: number | null;
}

export class BatchResponseDto {
  @ApiProperty({ description: 'Batch ID' })
  loteId: number;

  @ApiProperty({ description: 'Community ID' })
  comunidadId: number;

  @ApiProperty({ description: 'Period ID' })
  periodoId: number;

  @ApiProperty({ description: 'Batch status' })
  estado: string;

  @ApiProperty({ description: 'Total amount' })
  totalMonto: number;

  @ApiPropertyOptional({ description: 'Notes' })
  notas?: string | null;

  @ApiPropertyOptional({ description: 'Created by' })
  creadoPor?: string | null;

  @ApiProperty({ description: 'Total emissions count' })
  totalEmisiones: number;

  @ApiProperty({ description: 'Billing month (1-12)', example: 8 })
  mes: number;

  @ApiPropertyOptional({
    description: 'Work route ID that generated the batch',
    example: 2,
  })
  rutaId?: number | null;

  @ApiPropertyOptional({
    description: 'Work route information',
    type: BatchRutaResponseDto,
  })
  ruta?: BatchRutaResponseDto | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Community information',
    type: BatchCommunityResponseDto,
  })
  comunidad?: BatchCommunityResponseDto | null;

  @ApiPropertyOptional({
    description: 'Period information',
    type: BatchPeriodoResponseDto,
  })
  periodoRel?: BatchPeriodoResponseDto | null;

  @ApiPropertyOptional({
    description: 'Pre-invoices preview in batch',
    type: [PreInvoiceResponseDto],
  })
  prefacturas?: PreInvoiceResponseDto[];

  static fromRow(entity: BatchRow): BatchResponseDto {
    const dto = new BatchResponseDto();
    dto.loteId = Number(entity.loteId);
    dto.comunidadId = entity.comunidadId;
    dto.periodoId = entity.periodoId;
    dto.mes = entity.mes;
    dto.rutaId = entity.rutaId ? Number(entity.rutaId) : null;
    dto.ruta = entity.ruta
      ? {
          rutaId: Number(entity.ruta.rutaId),
          nombre: entity.ruta.nombre ?? null,
        }
      : null;
    dto.estado = entity.estado;
    dto.totalMonto = Number(entity.totalMonto);
    dto.notas = entity.notas ?? null;
    dto.creadoPor = entity.creadoPor ?? null;
    dto.totalEmisiones = entity.totalEmisiones;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.comunidad = entity.comunidad
      ? {
          comunidadId: entity.comunidad.comunidadId,
          nombre: entity.comunidad.nombre,
        }
      : null;
    dto.periodoRel = entity.periodoRel
      ? {
          periodoId: entity.periodoRel.periodoId,
          nombre: entity.periodoRel.nombre,
          fechaInicio: entity.periodoRel.fechaInicio ?? null,
          fechaFin: entity.periodoRel.fechaFin ?? null,
        }
      : null;
    // `prefacturas` no esta en BatchRow (el default include no la trae).
    // Solo se hidrata en `findById` con un include nested. Hacemos cast
    // explicito en runtime para proyectar las prefacturas cuando el
    // caller las trae; si no, queda undefined.
    const entityWithPrefacturas = entity as unknown as {
      prefacturas?: Parameters<typeof PreInvoiceResponseDto.fromRowList>[0];
    };
    dto.prefacturas = entityWithPrefacturas.prefacturas
      ? PreInvoiceResponseDto.fromRowList(entityWithPrefacturas.prefacturas)
      : undefined;
    return dto;
  }

  static fromRowList(entities: BatchRow[]): BatchResponseDto[] {
    return entities.map(BatchResponseDto.fromRow);
  }
}
