export interface ReadingContractRef {
  contratoId: bigint;
  numeroGuia: string;
  direccionSuministro: string;
  estadoServicio: string;
  sector?: {
    nombre: string;
  } | null;
  cliente?: {
    clienteId: bigint;
    nombres: string;
    apellidos: string;
    razonSocial?: string | null;
    identificacion: string;
  } | null;
}

export interface ReadingMeterRef {
  medidorId: bigint;
  serie: string;
  marca: string;
  modelo: string;
}

export interface ReadingPeriodRef {
  periodoId: number;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
}
