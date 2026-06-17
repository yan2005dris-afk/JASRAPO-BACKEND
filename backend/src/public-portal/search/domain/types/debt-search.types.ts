import type { IPrefacturaParaCalculo } from 'src/infrastructure/common/utils/debt-calculator.util';

export type { IPrefacturaParaCalculo };

export type TipoBusquedaDeuda = 'identificacion' | 'nombre' | 'numeroGuia';

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
