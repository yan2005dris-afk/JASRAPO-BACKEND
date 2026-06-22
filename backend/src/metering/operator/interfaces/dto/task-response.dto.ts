import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedidorInfo {
  @ApiProperty({ description: 'ID del medidor', example: '42' })
  medidorId: string;

  @ApiProperty({ description: 'Serie del medidor', example: 'MED-001' })
  serie: string;

  @ApiPropertyOptional({ description: 'Latitud', example: -33.45 })
  latitud?: number;

  @ApiPropertyOptional({ description: 'Longitud', example: -70.66 })
  longitud?: number;
}

export class OperarioInfo {
  @ApiProperty({ description: 'ID del usuario', example: 10 })
  usuarioId: number;

  @ApiProperty({ description: 'Nombres del operario', example: 'Juan' })
  nombres: string;

  @ApiProperty({ description: 'Apellidos del operario', example: 'Pérez' })
  apellidos: string;
}

export class TaskRutaPuntoDto {
  @ApiProperty({ description: 'Latitud del punto', example: -0.9677 })
  latitud: number;

  @ApiProperty({ description: 'Longitud del punto', example: -80.7089 })
  longitud: number;

  @ApiProperty({ description: 'Serie del medidor', example: 'MED-001' })
  serie: string;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  clienteNombre: string;
}

export class TaskResponseDto {
  @ApiProperty({ description: 'ID de la ruta/tarea', example: '1' })
  rutaId: string;

  @ApiProperty({ description: 'Tipo de ruta', example: 'INSTALACION' })
  tipoRuta: string;

  @ApiProperty({
    description: 'Nombre de la tarea',
    example: 'Instalación MED-001',
  })
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción de la tarea' })
  descripcion?: string;

  @ApiProperty({ description: 'Estado actual', example: 'PENDIENTE' })
  estado: string;

  @ApiProperty({ description: 'Orden geográfico', example: 1 })
  orden: number;

  @ApiPropertyOptional({ description: 'Observación' })
  observacion?: string;

  @ApiPropertyOptional({ description: 'Fecha límite' })
  fechaLimite?: string;

  @ApiProperty({ description: 'ID del operario asignado', example: 10 })
  operarioId: number;

  @ApiProperty({ description: 'ID de la comunidad', example: 5 })
  comunidadId: number;

  @ApiPropertyOptional({ description: 'ID del sector', example: 3 })
  sectorId?: number;

  @ApiPropertyOptional({ description: 'Fecha planificada' })
  fechaPlanificada?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio' })
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin' })
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Información del medidor asociado',
    type: () => MedidorInfo,
    nullable: true,
  })
  medidor?: MedidorInfo | null;

  @ApiPropertyOptional({
    description: 'Información del operario asignado',
    type: () => OperarioInfo,
  })
  operario?: OperarioInfo;

  @ApiPropertyOptional({
    description:
      'Puntos/medidores que componen la ruta (para toma de lecturas)',
    type: [TaskRutaPuntoDto],
  })
  rutaPuntos?: TaskRutaPuntoDto[];
}
