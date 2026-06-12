export type TipoBusquedaDeuda = 'identificacion' | 'nombre' | 'numeroGuia';

export interface PrefacturaDeudaRaw {
  totalPagar: number | { toNumber?: () => number };
  abono: number | { toNumber?: () => number };
  periodoId: number;
}

export interface ContratoConDeudaRaw {
  contratoId: bigint;
  numeroGuia: string;
  estado: string;
  cliente: {
    clienteId: bigint;
    identificacion: string | null;
    nombres: string | null;
    apellidos: string | null;
  };
  prefacturasImpagadas: PrefacturaDeudaRaw[];
}
