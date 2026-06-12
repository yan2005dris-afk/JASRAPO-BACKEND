export interface CreateRouteData {
  nombre: string;
  descripcion?: string;
  operarioId: number;
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number;
  fechaPlanificada?: Date | null;
  estado?: string;
}
