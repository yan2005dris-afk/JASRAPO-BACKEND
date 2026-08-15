import { RouteEntity } from '../../domain/entities/route.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export interface RouteRaw {
  rutaId: bigint;
  nombre: string;
  descripcion?: string | null;
  operarioId: number;
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number | null;
  periodoId?: number | null;
  estado: string;
  fechaPlanificada?: Date | string | null;
  fechaInicio?: Date | string | null;
  fechaFin?: Date | string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

function formatDateField(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return DateUtil.formatForFrontend(value);
}

export class RouteMapper {
  static toEntity(route: RouteRaw): RouteEntity {
    return new RouteEntity({
      rutaId: route.rutaId,
      nombre: route.nombre,
      descripcion: route.descripcion ?? null,
      operarioId: route.operarioId,
      tipoRuta: route.tipoRuta,
      comunidadId: route.comunidadId,
      sectorId: route.sectorId ?? null,
      periodoId: route.periodoId ?? null,
      fechaPlanificada: formatDateField(route.fechaPlanificada),
      fechaInicio: formatDateField(route.fechaInicio),
      fechaFin: formatDateField(route.fechaFin),
      estado: route.estado,
    });
  }

  static toEntityList(routes: RouteRaw[]): RouteEntity[] {
    return routes.map((r) => RouteMapper.toEntity(r));
  }
}
