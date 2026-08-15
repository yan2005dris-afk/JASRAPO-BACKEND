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

  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<CommunityEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.nombre !== undefined && this.nombre !== null && this.nombre.trim() === '') {
      throw new Error('El nombre de la comunidad no puede estar vacío');
    }
    if (this.codigo !== undefined && this.codigo !== null && this.codigo.trim() === '') {
      throw new Error('El código de la comunidad no puede estar vacío');
    }
    if (this.porcentajeTasaSeguridad !== undefined && this.porcentajeTasaSeguridad !== null) {
      if (this.porcentajeTasaSeguridad < 0 || this.porcentajeTasaSeguridad > 100) {
        throw new Error('El porcentaje de tasa de seguridad debe estar entre 0 y 100');
      }
    }
  }
}
