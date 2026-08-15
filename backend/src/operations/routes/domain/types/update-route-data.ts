export interface UpdateRouteData {
  nombre?: string;
  descripcion?: string;
  operarioId?: number;
  estado?: string;
  fechaPlanificada?: Date | null;
  periodoId?: number;
}
