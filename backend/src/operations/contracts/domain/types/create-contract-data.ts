export interface CreateContractData {
  clienteId: bigint;
  sectorId?: number | null;
  categoriaTarifaId: number;
  numeroGuia: string;
  fechaInicio?: Date;
  direccionSuministro: string;
  estado: string;
  creadoPor?: string | null;
  comunidadId: number;
  medidorId?: bigint;
  lecturaInicial?: number;
}
