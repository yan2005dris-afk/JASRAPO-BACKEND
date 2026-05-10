import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EstadoConvenioResponseDto {
  @ApiProperty({ example: 1, description: 'ID del estado' })
  estadoConvenioId: number;

  @ApiProperty({ example: 'ACTIVO', description: 'Código del estado' })
  codigo: string;

  @ApiProperty({
    example: 'Activo',
    description: 'Nombre descriptivo del estado',
  })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Convenio vigente con cuotas en curso',
    description: 'Descripción del estado',
  })
  descripcion: string | null;

  @ApiProperty({ example: 1, description: 'Orden de visualización' })
  orden: number;
}
