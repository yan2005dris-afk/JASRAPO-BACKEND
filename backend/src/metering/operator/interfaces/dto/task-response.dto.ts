import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OperatorTask } from '../../domain/repositories/repository-types';

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

  constructor(partial: Partial<TaskResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(task: OperatorTask): TaskResponseDto {
    return new TaskResponseDto({
      rutaId: task.rutaId.toString(),
      tipoRuta: task.tipoRuta,
      nombre: task.nombre,
      descripcion: task.descripcion ?? undefined,
      estado: task.estado,
      orden: task.orden,
      observacion: task.observacion ?? undefined,
      fechaLimite: task.fechaLimite?.toISOString() ?? undefined,
      operarioId: task.operarioId,
      comunidadId: task.comunidadId,
      sectorId: task.sectorId ?? undefined,
      fechaPlanificada: task.fechaPlanificada?.toISOString() ?? undefined,
      fechaInicio: task.fechaInicio?.toISOString() ?? undefined,
      fechaFin: task.fechaFin?.toISOString() ?? undefined,
      operario: task.operario
        ? {
            usuarioId: task.operario.usuarioId,
            nombres: task.operario.nombres,
            apellidos: task.operario.apellidos,
          }
        : undefined,
      rutaPuntos: task.rutaPuntos,
    });
  }
}
