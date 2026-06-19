import type { EstadoContrato } from 'src/shared/enums';

export interface CreateContractWithMeterCommand {
  clienteId: bigint;
  categoriaTarifaId: number;
  medidorId: bigint;
  comunidadId: number;
  sectorId: number | null;
  numeroGuia: string;
  direccionSuministro: string;
  estado: EstadoContrato;
  creadoPor?: string;
  lecturaInicial: number;
}
