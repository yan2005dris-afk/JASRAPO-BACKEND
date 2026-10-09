import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  RouteRow,
  ReadingForRouteRow,
} from '../../infrastructure/repositories/route.include';
import { DateUtil } from 'src/shared/utils/date.util';

function formatDateField(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return DateUtil.formatForFrontend(value);
}

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

  @ApiPropertyOptional({
    example: 10,
    nullable: true,
    description: 'ID del operario asignado',
  })
  operarioId: number | null;

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

  static fromRow(entity: RouteRow): RouteResponseDto {
    const dto = new RouteResponseDto();
    dto.rutaId = entity.rutaId;
    dto.nombre = entity.nombre;
    dto.descripcion = entity.descripcion ?? null;
    dto.operarioId = entity.operarioId;
    dto.tipoRuta = entity.tipoActividad.codigo;
    dto.comunidadId = entity.comunidadId;
    dto.sectorId = entity.sectorId ?? null;
    dto.periodoId = entity.periodoId ?? null;
    dto.estado = entity.estado;
    dto.fechaInicio = formatDateField(entity.fechaInicio);
    dto.fechaFin = formatDateField(entity.fechaFin);
    return dto;
  }

  static fromRowList(entities: RouteRow[]): RouteResponseDto[] {
    return entities.map((e) => RouteResponseDto.fromRow(e));
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

  @ApiPropertyOptional({
    example: 'SER-1234',
    description: 'Serie del medidor',
  })
  medidorSerie?: string;

  @ApiPropertyOptional({ example: 120, description: 'Lectura anterior' })
  lecturaAnterior?: number;

  @ApiPropertyOptional({ example: 145, description: 'Lectura actual' })
  lecturaActual?: number;

  @ApiPropertyOptional({ example: 25, description: 'Consumo calculado en m3' })
  consumoCalculado?: number;

  @ApiPropertyOptional({
    example: 'PENDIENTE',
    description: 'Estado de la lectura',
  })
  estadoLectura?: string;

  static fromRow(lectura: ReadingForRouteRow): ReadingForRouteResponseDto {
    const activeHistory = lectura.medidor?.historial?.find(
      (h) => h.fechaHasta === null,
    );
    const contrato = activeHistory?.contrato;
    const cliente = contrato?.cliente;

    const clienteNombre = cliente
      ? [cliente.nombres, cliente.apellidos].filter(Boolean).join(' ').trim()
      : 'Sin cliente';

    const hasActualReading =
      lectura.lecturaActual !== null &&
      lectura.lecturaActual !== undefined &&
      Number(lectura.lecturaActual) > 0;

    const isPending = lectura.estado === 'PENDIENTE' && !hasActualReading;

    const rawActual =
      lectura.lecturaActual !== undefined && lectura.lecturaActual !== null
        ? Number(lectura.lecturaActual)
        : 0;
    const rawAnterior =
      lectura.lecturaAnterior !== undefined && lectura.lecturaAnterior !== null
        ? Number(lectura.lecturaAnterior)
        : 0;
    const rawConsumo = isPending ? 0 : Math.max(0, rawActual - rawAnterior);

    const dto = new ReadingForRouteResponseDto();
    dto.lecturaId = lectura.lecturaId;
    dto.guia = contrato?.numeroGuia ?? 'Sin guía';
    dto.clienteNombre = clienteNombre;
    dto.direccion = contrato?.direccionSuministro ?? 'Sin dirección';
    dto.sector = contrato?.sector?.nombre ?? 'Sin sector';
    dto.estadoContrato =
      (contrato as any)?.estadoServicio ??
      (contrato as any)?.estado ??
      'DESCONOCIDO';
    dto.medidorSerie = lectura.medidor?.serie ?? undefined;
    dto.lecturaAnterior = rawAnterior;
    dto.lecturaActual = isPending ? (null as any) : rawActual;
    dto.consumoCalculado = rawConsumo;
    dto.estadoLectura = lectura.estado ?? undefined;
    return dto;
  }

  static fromRowList(
    entities: ReadingForRouteRow[],
  ): ReadingForRouteResponseDto[] {
    return entities.map((e) => ReadingForRouteResponseDto.fromRow(e));
  }
}
