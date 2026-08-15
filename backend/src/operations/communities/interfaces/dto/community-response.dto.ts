import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CommunityEntity } from '../../domain/entities/community.entity';

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

  static fromEntity(entity: CommunityEntity): CommunityResponseDto {
    const dto = new CommunityResponseDto();
    dto.comunidadId = entity.comunidadId;
    dto.nombre = entity.nombre;
    dto.codigo = entity.codigo;
    dto.porcentajeTasaSeguridad = entity.porcentajeTasaSeguridad ?? null;
    dto.sectores = entity.sectores;
    dto.deletedAt = entity.deletedAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntityList(entities: CommunityEntity[]): CommunityResponseDto[] {
    return entities.map((e) => CommunityResponseDto.fromEntity(e));
  }
}
