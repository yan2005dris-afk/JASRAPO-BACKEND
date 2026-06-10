import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeterResponseDto {
  @ApiProperty({
    description: 'ID único del medidor',
    example: '1',
  })
  medidorId: bigint;

  @ApiProperty({
    description: 'Marca del medidor',
    example: 'Itron',
  })
  marca: string;

  @ApiProperty({
    description: 'Modelo del medidor',
    example: 'CX1000',
  })
  modelo: string;

  @ApiProperty({
    description: 'Número de serie único del medidor',
    example: 'SN-2024-001234',
  })
  serie: string;

  @ApiProperty({
    description: 'Estado actual del medidor',
    example: 'BODEGA',
  })
  estado: string;

  @ApiPropertyOptional({
    description: 'Fecha de instalación del medidor (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  fechaInstalacion: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de baja del medidor (YYYY-MM-DD)',
    example: null,
  })
  fechaBaja: string | null;

  @ApiPropertyOptional({
    description: 'Motivo de la baja',
    example: 'Obsoleto',
  })
  motivo: string | null;

  @ApiPropertyOptional({
    description: 'Latitud de ubicación',
    example: -33.4489,
  })
  latitud: number | null;

  @ApiPropertyOptional({
    description: 'Longitud de ubicación',
    example: -70.6693,
  })
  longitud: number | null;

  constructor(partial: Partial<MeterResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * Ejemplo de respuesta para Swagger
 */
export const MeterResponseExample = {
  medidorId: '1',
  marca: 'Itron',
  modelo: 'CX1000',
  serie: 'SN-2024-001234',
  estado: 'BODEGA',
  fechaInstalacion: '2024-01-15',
  fechaBaja: null,
  motivo: null,
  latitud: -33.4489,
  longitud: -70.6693,
};
