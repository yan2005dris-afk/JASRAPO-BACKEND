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
  createdAt: Date;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
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
      periodoId: route.periodoId,
      fechaPlanificada: DateUtil.formatForFrontend(route.createdAt),
      fechaInicio: DateUtil.formatForFrontend(route.fechaInicio),
      fechaFin: DateUtil.formatForFrontend(route.fechaFin),
      estado: route.estado,
    });
  }
}
