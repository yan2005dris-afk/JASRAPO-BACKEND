import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SectorRow } from '../../domain/types/sector.types';
import type { ComunidadRef } from '../../domain/types/sector.types';

export class ComunidadRefDto {
  @ApiProperty({ example: 1, description: 'ID de la comunidad' })
  comunidadId: number;

  @ApiProperty({ example: 'COM-001', description: 'Código de la comunidad' })
  codigo: string;

  @ApiProperty({ example: 'San José', description: 'Nombre de la comunidad' })
  nombre: string;
}

export class SectorResponseDto {
  @ApiProperty({ example: 1, description: 'ID del sector' })
  sectorId: number;

  @ApiProperty({ example: 'Sector Centro', description: 'Nombre del sector' })
  nombre: string;

  @ApiProperty({ example: 'SEC-001', description: 'Código único del sector' })
  codigo: string;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'ID de la comunidad asignada',
  })
  comunidadId: number | null;

  @ApiPropertyOptional({
    type: () => ComunidadRefDto,
    nullable: true,
    description: 'Comunidad asociada',
  })
  comunidades?: ComunidadRef | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Fecha de eliminación',
  })
  deletedAt?: Date | null;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de actualización',
  })
  updatedAt: Date;

  static fromRow(row: SectorRow): SectorResponseDto {
    const dto = new SectorResponseDto();
    dto.sectorId = row.sectorId;
    dto.nombre = row.nombre;
    dto.codigo = row.codigo;
    dto.comunidadId = row.comunidadId;
    dto.comunidades = row.comunidades ?? null;
    dto.deletedAt = row.deletedAt;
    dto.createdAt = row.createdAt;
    dto.updatedAt = row.updatedAt;
    return dto;
  }

  static fromRowList(rows: SectorRow[]): SectorResponseDto[] {
    return rows.map((r) => SectorResponseDto.fromRow(r));
  }
}
