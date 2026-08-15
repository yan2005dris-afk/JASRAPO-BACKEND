import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RouteEntity } from '../../domain/entities/route.entity';
import type { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';

export class RouteResponseDto {
  @ApiProperty({ example: '1', description: 'ID único de la ruta' })
  rutaId: bigint;

  @ApiProperty({ example: 'Ruta San José', description: 'Nombre de la ruta' })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Ruta mensual',
    nullable: true,
    description: 'Descripción',
  })
  descripcion?: string | null;

  @ApiProperty({ example: 10, description: 'ID del operario asignado' })
  operarioId: number;

  @ApiProperty({ example: 'REGULAR', description: 'Tipo de ruta' })
  tipoRuta: string;

  @ApiProperty({ example: 1, description: 'ID de la comunidad' })
  comunidadId: number;

  @ApiPropertyOptional({
    example: 2,
    nullable: true,
    description: 'ID del sector',
  })
  sectorId?: number | null;

  @ApiPropertyOptional({
    example: 3,
    nullable: true,
    description: 'ID del periodo',
  })
  periodoId: number | null;

  @ApiProperty({ example: 'PENDIENTE', description: 'Estado de la ruta' })
  estado: string;

  @ApiPropertyOptional({
    example: '2026-06-11T00:00:00.000Z',
    nullable: true,
    description: 'Fecha planificada',
  })
  fechaPlanificada: string | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Fecha de inicio',
  })
  fechaInicio: string | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Fecha de fin',
  })
  fechaFin: string | null;

  static fromEntity(entity: RouteEntity): RouteResponseDto {
    const dto = new RouteResponseDto();
    dto.rutaId = entity.rutaId;
    dto.nombre = entity.nombre;
    dto.descripcion = entity.descripcion ?? null;
    dto.operarioId = entity.operarioId;
    dto.tipoRuta = entity.tipoRuta;
    dto.comunidadId = entity.comunidadId;
    dto.sectorId = entity.sectorId ?? null;
    dto.periodoId = entity.periodoId ?? null;
    dto.estado = entity.estado;
    dto.fechaPlanificada = entity.fechaPlanificada ?? null;
    dto.fechaInicio = entity.fechaInicio ?? null;
    dto.fechaFin = entity.fechaFin ?? null;
    return dto;
  }

  static fromEntityList(entities: RouteEntity[]): RouteResponseDto[] {
    return entities.map((e) => RouteResponseDto.fromEntity(e));
  }
}

export class ReadingForRouteResponseDto {
  @ApiProperty({ example: '100', description: 'ID de la lectura' })
  lecturaId: bigint;

  @ApiProperty({ example: 'G-001', description: 'Número de guía' })
  guia: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del cliente' })
  clienteNombre: string;

  @ApiProperty({ example: 'Av. Amazonas 123', description: 'Dirección' })
  direccion: string;

  @ApiPropertyOptional({
    example: 'Sector Norte',
    nullable: true,
    description: 'Sector',
  })
  sector?: string;

  @ApiProperty({ example: 'ACTIVO', description: 'Estado del contrato' })
  estadoContrato: string;

  static fromEntity(entity: ReadingForRouteEntity): ReadingForRouteResponseDto {
    const dto = new ReadingForRouteResponseDto();
    dto.lecturaId = entity.lecturaId;
    dto.guia = entity.guia;
    dto.clienteNombre = entity.clienteNombre;
    dto.direccion = entity.direccion;
    dto.sector = entity.sector;
    dto.estadoContrato = entity.estadoContrato;
    return dto;
  }

  static fromEntityList(
    entities: ReadingForRouteEntity[],
  ): ReadingForRouteResponseDto[] {
    return entities.map((e) => ReadingForRouteResponseDto.fromEntity(e));
  }
}
