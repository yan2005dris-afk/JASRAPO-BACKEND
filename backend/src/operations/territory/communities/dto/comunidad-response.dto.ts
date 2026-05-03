import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ComunidadResponseDto {
  @ApiProperty({ description: 'ID de la comunidad', example: 1 })
  @Expose()
  comunidadId: number;

  @ApiProperty({
    description: 'Nombre de la comunidad',
    example: 'Barrio Las Palmeras',
  })
  @Expose()
  nombre: string;

  @ApiProperty({ description: 'Código de la comunidad', example: 'PAL-001' })
  @Expose()
  codigo: string;

  @ApiProperty({ description: 'Porcentaje de tasa de seguridad', example: 5.5 })
  @Expose()
  @Transform(({ value }) => (value ? Number(value) : null))
  porcentajeTasaSeguridad: number | null;
}
