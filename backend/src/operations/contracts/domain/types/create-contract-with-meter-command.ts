import type { EstadoGenerico } from 'src/generated/prisma/client';

export interface CreateContractWithMeterCommand {
  clienteId: bigint;
  categoriaTarifaId: number;
  medidorId: bigint;
  comunidadId: number;
  sectorId: number | null;
  numeroGuia: string;
  direccionSuministro: string;
  estado: EstadoGenerico;
  creadoPor?: string;
  lecturaInicial: number;
}
