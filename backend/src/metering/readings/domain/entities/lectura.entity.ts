import { ApiProperty } from '@nestjs/swagger';

export class LecturaEntity {
  @ApiProperty({ example: '1', description: 'ID de la lectura' })
  lecturaId: bigint;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de la lectura',
  })
  fecha: Date;

  @ApiProperty({ example: 100, description: 'Lectura anterior registrada' })
  lecturaAnterior: number;

  @ApiProperty({ example: 150, description: 'Lectura actual registrada' })
  lecturaActual: number;

  @ApiProperty({ example: 50, description: 'Consumo calculado de agua' })
  consumoCalculado: number;

  @ApiProperty({ example: '1', description: 'ID del medidor asociado' })
  medidorId: bigint;

  @ApiProperty({
    example: 'Anomalía menor',
    description: 'Descripción de anomalía encontrada',
    nullable: true,
  })
  descripcionAnomalia: string | null;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de validación',
    nullable: true,
  })
  fechaValidacion: Date | null;

  @ApiProperty({
    example: 'http://storage/photo.jpg',
    description: 'URL de la foto',
    nullable: true,
  })
  fotoUrl: string | null;

  @ApiProperty({
    example: false,
    description: 'Indica si la lectura ha sido validada',
  })
  isValidada: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si es la lectura inicial de instalación',
  })
  lecturaInicial: boolean;

  @ApiProperty({ example: 1, description: 'ID del período de facturación' })
  periodoId: number;

  @ApiProperty({
    example: false,
    description: 'Indica si tiene alguna anomalía',
  })
  tieneAnomalia: boolean;

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

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de eliminación lógica',
    nullable: true,
  })
  deletedAt: Date | null;

  // Relaciones opcionales del dominio
  contrato?: {
    contratoId: bigint;
    numeroGuia: string;
    direccionSuministro: string;
    estado: string;
  } | null;

  medidor?: {
    medidorId: bigint;
    serie: string;
    marca: string;
    modelo: string;
  } | null;

  periodoRel?: {
    periodoId: number;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
  } | null;

  constructor(partial: Partial<LecturaEntity>) {
    Object.assign(this, partial);
  }
}
