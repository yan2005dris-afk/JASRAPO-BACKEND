import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommunityResponseDto {
  @ApiProperty({ example: 1, description: 'ID de la comunidad' })
  comunidadId: number;

  @ApiProperty({ example: 'San José', description: 'Nombre de la comunidad' })
  nombre: string;

  @ApiProperty({ example: 'SJ-001', description: 'Código único de la comunidad' })
  codigo: string;

  @ApiPropertyOptional({ example: 'Comunidad rural San José', nullable: true, description: 'Descripción' })
  descripcion: string | null;

  @ApiProperty({ example: 5, description: 'Porcentaje de tasa de seguridad' })
  porcentajeTasaSeguridad: number;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Fecha de eliminación' })
  deletedAt?: Date | null;

  @ApiProperty({ example: '2026-06-11T00:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-11T00:00:00.000Z', description: 'Fecha de actualización' })
  updatedAt: Date;
}
