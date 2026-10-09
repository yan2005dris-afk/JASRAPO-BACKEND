import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CommunityRow } from '../../domain/types/community.types';

export class SectorItemDto {
  @ApiProperty({ example: 1 })
  sectorId: number;

  @ApiProperty({ example: 'Centro' })
  nombre: string;

  @ApiProperty({ example: 'SEC-001' })
  codigo: string;
}

export class CommunityResponseDto {
  @ApiProperty({ example: 1, description: 'ID de la comunidad' })
  comunidadId: number;

  @ApiProperty({ example: 'San José', description: 'Nombre de la comunidad' })
  nombre: string;

  @ApiProperty({
    example: 'SJ-001',
    description: 'Código único de la comunidad',
  })
  codigo: string;

  @ApiPropertyOptional({
    example: 5,
    nullable: true,
    description: 'Porcentaje de tasa de seguridad',
  })
  porcentajeTasaSeguridad: number | null;

  @ApiPropertyOptional({
    type: () => [SectorItemDto],
    nullable: true,
    description: 'Sectores relacionados',
  })
  sectores?: SectorItemDto[];

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

  static fromRow(row: CommunityRow): CommunityResponseDto {
    const dto = new CommunityResponseDto();
    dto.comunidadId = row.comunidadId;
    dto.nombre = row.nombre;
    dto.codigo = row.codigo;
    // Coercion Prisma.Decimal -> number; el row Prisma llega como Decimal
    // porque el schema usa @db.Decimal(18, 2).
    dto.porcentajeTasaSeguridad =
      row.porcentajeTasaSeguridad != null
        ? Number(row.porcentajeTasaSeguridad)
        : null;
    dto.sectores = (row.sector ?? []) as SectorItemDto[];
    dto.deletedAt = row.deletedAt;
    dto.createdAt = row.createdAt;
    dto.updatedAt = row.updatedAt;
    return dto;
  }

  static fromRowList(rows: CommunityRow[]): CommunityResponseDto[] {
    return rows.map((r) => CommunityResponseDto.fromRow(r));
  }
}
