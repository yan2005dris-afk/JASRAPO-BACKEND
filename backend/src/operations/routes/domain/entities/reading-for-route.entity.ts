export interface ReadingForRouteEntityProps {
  lecturaId: bigint;
  guia: string;
  clienteNombre: string;
  direccion: string;
  sector?: string;
  estadoContrato: string;
  medidorSerie?: string;
  lecturaAnterior?: number;
  lecturaActual?: number;
  consumoCalculado?: number;
  estadoLectura?: string;
}

export class ReadingForRouteEntity {
  lecturaId: bigint;
  guia: string;
  clienteNombre: string;
  direccion: string;
  sector?: string;
  estadoContrato: string;
  medidorSerie?: string;
  lecturaAnterior?: number;
  lecturaActual?: number;
  consumoCalculado?: number;
  estadoLectura?: string;

  constructor(props: ReadingForRouteEntityProps) {
    this.lecturaId = props.lecturaId;
    this.guia = props.guia;
    this.clienteNombre = props.clienteNombre;
    this.direccion = props.direccion;
    this.sector = props.sector;
    this.estadoContrato = props.estadoContrato;
    this.medidorSerie = props.medidorSerie;
    this.lecturaAnterior = props.lecturaAnterior;
    this.lecturaActual = props.lecturaActual;
    this.consumoCalculado = props.consumoCalculado;
    this.estadoLectura = props.estadoLectura;
  }
}
