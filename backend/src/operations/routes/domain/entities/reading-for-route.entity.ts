export interface ReadingForRouteEntityProps {
  lecturaId: bigint;
  guia: string;
  clienteNombre: string;
  direccion: string;
  sector?: string;
  estadoContrato: string;
}

export class ReadingForRouteEntity {
  lecturaId: bigint;
  guia: string;
  clienteNombre: string;
  direccion: string;
  sector?: string;
  estadoContrato: string;

  constructor(props: ReadingForRouteEntityProps) {
    this.lecturaId = props.lecturaId;
    this.guia = props.guia;
    this.clienteNombre = props.clienteNombre;
    this.direccion = props.direccion;
    this.sector = props.sector;
    this.estadoContrato = props.estadoContrato;
  }
}
