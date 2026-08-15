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

export class RouteMapper {
  static toEntity(route: RouteRaw): RouteEntity {
    return new RouteEntity({
      rutaId: route.rutaId,
      nombre: route.nombre,
      descripcion: route.descripcion,
      operarioId: route.operarioId,
      tipoRuta: route.tipoRuta,
      comunidadId: route.comunidadId,
      sectorId: route.sectorId,
      periodoId: route.periodoId,
      fechaPlanificada: DateUtil.formatForFrontend(route.fechaPlanificada),
      fechaInicio: DateUtil.formatForFrontend(route.fechaInicio),
      fechaFin: DateUtil.formatForFrontend(route.fechaFin),
      estado: route.estado,
    });
  }

  static toEntityList(routes: RouteRaw[]): RouteEntity[] {
    return routes.map((r) => RouteMapper.toEntity(r));
  }
}
