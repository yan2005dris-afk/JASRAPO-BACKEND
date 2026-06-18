export interface CreateRouteData {
  nombre: string;
  descripcion?: string;
  operarioId: number;
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number;
  periodoId: number;
  fechaPlanificada?: Date | null;
  estado?: string;
}
