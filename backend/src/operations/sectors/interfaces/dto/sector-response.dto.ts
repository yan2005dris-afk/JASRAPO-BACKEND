import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  SectorEntity,
  ComunidadRef,
} from '../../domain/entities/sector.entity';

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

  static fromEntity(entity: SectorEntity): SectorResponseDto {
    const dto = new SectorResponseDto();
    dto.sectorId = entity.sectorId;
    dto.nombre = entity.nombre;
    dto.codigo = entity.codigo;
    dto.comunidadId = entity.comunidadId;
    dto.comunidades = entity.comunidades ?? null;
    dto.deletedAt = entity.deletedAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntityList(entities: SectorEntity[]): SectorResponseDto[] {
    return entities.map((e) => SectorResponseDto.fromEntity(e));
  }
}
