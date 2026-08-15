export interface ReadingContractRef {
  contratoId: bigint;
  numeroGuia: string;
  direccionSuministro: string;
  estado: string;
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
