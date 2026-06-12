import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommunityEntity {
  @ApiProperty()
  comunidadId: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  codigo: string;

  @ApiPropertyOptional({ nullable: true })
  porcentajeTasaSeguridad: number | null;

  @ApiPropertyOptional({
    type: () => [Object],
    nullable: true,
    description: 'Sectores relacionados',
  })
  sectores?: { sectorId: number; nombre: string; codigo: string }[];

  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<CommunityEntity>) {
    Object.assign(this, partial);
  }
}
