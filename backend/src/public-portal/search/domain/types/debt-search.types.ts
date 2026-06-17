export type TipoBusquedaDeuda = 'identificacion' | 'nombre' | 'numeroGuia';

export interface IPrefacturaParaCalculo {
  totalPagar: number | { toNumber?: () => number };
  abono: number | { toNumber?: () => number };
  periodoId: number;
}

export interface IContratoConDeudaRaw {
  contratoId: bigint;
  numeroGuia: string;
  estado: string;
  cliente: {
    clienteId: bigint;
    identificacion: string | null;
    nombres: string | null;
    apellidos: string | null;
  };
  prefacturasImpagadas: IPrefacturaParaCalculo[];
}
