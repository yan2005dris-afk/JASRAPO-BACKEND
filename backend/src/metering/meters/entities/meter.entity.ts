import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoMedidor } from 'src/generated/prisma/client';

export class MeterEntity {
  @ApiProperty({ description: 'Unique meter ID', example: '1' })
  medidorId: bigint;

  @ApiPropertyOptional({ description: 'Contract ID associated with the meter' })
  contratoId: bigint | null;

  @ApiProperty({ description: 'Meter brand', example: 'Itron' })
  marca: string;

  @ApiProperty({ description: 'Meter model', example: 'CX1000' })
  modelo: string;

  @ApiProperty({
    description: 'Meter serial number (unique)',
    example: 'SN-2024-001234',
  })
  serie: string;

  @ApiProperty({
    description: 'Meter status',
    enum: EstadoMedidor,
    example: 'BODEGA',
  })
  estado: EstadoMedidor;

  @ApiPropertyOptional({
    description: 'Installation date',
    example: '2024-01-15T00:00:00Z',
  })
  fechaInstalacion: Date | null;

  @ApiPropertyOptional({ description: 'Decommission date' })
  fechaBaja: Date | null;

  @ApiPropertyOptional({ description: 'Decommission reason' })
  motivo: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)' })
  deletedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: '-33.4489',
  })
  latitud: number | null;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: '-70.6693',
  })
  longitud: number | null;

  constructor(partial: Partial<MeterEntity>) {
    Object.assign(this, partial);
  }
}
