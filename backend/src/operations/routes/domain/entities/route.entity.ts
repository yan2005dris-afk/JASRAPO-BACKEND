export interface RouteEntityProps {
  rutaId: bigint;
  nombre: string;
  descripcion?: string | null;
  operarioId?: number | null;
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number | null;
  periodoId: number | null;
  estado: string;
  fechaInicio: string | null;
  fechaFin: string | null;
}

export class RouteEntity {
  rutaId: bigint;
  nombre: string;
  descripcion?: string | null;
  operarioId: number | null;
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number | null;
  periodoId: number | null;
  estado: string;
  fechaInicio: string | null;
  fechaFin: string | null;

  constructor(props: RouteEntityProps) {
    this.rutaId = props.rutaId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.operarioId = props.operarioId ?? null;
    this.tipoRuta = props.tipoRuta;
    this.comunidadId = props.comunidadId;
    this.sectorId = props.sectorId ?? null;
    this.periodoId = props.periodoId ?? null;
    this.estado = props.estado;
    this.fechaInicio = props.fechaInicio ?? null;
    this.fechaFin = props.fechaFin ?? null;
  }
}
