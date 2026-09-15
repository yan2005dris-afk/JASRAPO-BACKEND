import type {
  EstadoCobranzaContrato,
  EstadoContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';

export interface ContractFilters {
  contratoId?: bigint;
  numeroGuia?: string;
  clienteId?: bigint;
  sectorId?: number;
  categoriaTarifaId?: number;
  medidorId?: bigint;
  medidorSerie?: string;
  estado?: string;
  ubicacion?: string;
  search?: string;
  hasDebt?: boolean;
}

export interface CreateContractData {
  clienteId: bigint;
  categoriaTarifaId: number;
  numeroGuia: string;
  fechaInicio?: Date;
  direccionSuministro: string;
  estado: EstadoContrato;
  estadoServicio?: EstadoServicioContrato;
  estadoCobranza?: EstadoCobranzaContrato;
  creadoPor?: string | null;
  comunidadId: number;
  sectorId?: number | null;
}

export interface CreateContractWithMeterCommand {
  clienteId: bigint;
  categoriaTarifaId: number;
  medidorId: bigint;
  numeroGuia: string;
  direccionSuministro: string;
  estado: EstadoContrato;
  creadoPor?: string;
  comunidadId: number;
  sectorId: number | null;
  lecturaInicial: number;
}

export type UpdateContractData = Partial<CreateContractData> & {
  medidorId?: bigint;
  lecturaInicial?: number;
};
