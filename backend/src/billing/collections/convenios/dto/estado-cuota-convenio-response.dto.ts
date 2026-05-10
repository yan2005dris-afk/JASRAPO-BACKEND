import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EstadoCuotaConvenioResponseDto {
  @ApiProperty({ example: 1, description: 'ID del estado de cuota' })
  estadoCuotaConvenioId: number;

  @ApiProperty({ example: 'PENDIENTE', description: 'Código del estado' })
  codigo: string;

  @ApiProperty({
    example: 'Pendiente',
    description: 'Nombre descriptivo del estado',
  })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Cuota pendiente de pago, dentro del plazo',
    description: 'Descripción del estado',
  })
  descripcion: string | null;

  @ApiProperty({ example: 1, description: 'Orden de visualización' })
  orden: number;
}
