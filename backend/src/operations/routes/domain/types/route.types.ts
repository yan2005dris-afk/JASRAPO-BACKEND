export interface RouteFilters {
  operarioId?: number;
  tipoRuta?: string;
  estado?: string;
  periodoId?: number;
  comunidadId?: number;
  sectorId?: number;
}

export interface CreateRouteData {
  nombre: string;
  descripcion?: string | null;
  operarioId?: number | null;
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number | null;
  periodoId?: number | null;
  estado: string;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
}

export interface UpdateRouteData {
  nombre?: string;
  descripcion?: string | null;
  operarioId?: number | null;
  tipoRuta?: string;
  comunidadId?: number;
  sectorId?: number | null;
  periodoId?: number | null;
  estado?: string;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
}
