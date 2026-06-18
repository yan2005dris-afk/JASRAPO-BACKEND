export interface CreateContractWithMeterCommand {
  clienteId: bigint;
  categoriaTarifaId: number;
  medidorId: bigint;
  comunidadId: number;
  sectorId: number | null;
  numeroGuia: string;
  direccionSuministro: string;
  estado: string;
  creadoPor?: string;
  lecturaInicial: number;
}
