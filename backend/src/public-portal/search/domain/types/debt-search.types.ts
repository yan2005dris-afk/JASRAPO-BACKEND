export type TipoBusquedaDeuda = 'identificacion' | 'numeroGuia';

export interface IPrefacturaParaCalculo {
  totalPagar: number | { toNumber?: () => number };
  abono: number | { toNumber?: () => number };
  periodoId: number;
}

export interface IContratoConDeudaRaw {
  contratoId: bigint;
  numeroGuia: string;
  estado: string;
  estadoServicio?: string;
  estadoCobranza?: string;
  cliente: {
    clienteId: bigint;
    identificacion: string | null;
    nombres: string | null;
    apellidos: string | null;
  };
  prefacturasImpagadas: IPrefacturaParaCalculo[];
}

export interface IContratoResumenRaw {
  contratoId: bigint;
  numeroGuia: string;
  estado: string;
  estadoServicio?: string;
  estadoCobranza?: string;
  prefacturasImpagadas: IPrefacturaParaCalculo[];
}

export interface IClienteConContratosRaw {
  clienteId: bigint;
  identificacion: string | null;
  nombres: string | null;
  apellidos: string | null;
  contratos: IContratoResumenRaw[];
}
