import type { ContractProcedureData } from '../contract-procedure';
import type {
  EstadoCobranzaContrato,
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
  estadoServicio?: EstadoServicioContrato;
  estadoCobranza?: EstadoCobranzaContrato;
  ubicacion?: string;
  search?: string;
  hasDebt?: boolean;
}

export interface CreateContractData extends ContractProcedureData {
  registradoPorId?: number;
  clienteId: bigint;
  categoriaTarifaId: number;
  numeroGuia: string;
  fechaInicio?: Date;
  direccionSuministro: string;
  estadoServicio?: EstadoServicioContrato;
  estadoCobranza?: EstadoCobranzaContrato;
  creadoPor?: string | null;
  comunidadId: number;
  sectorId?: number | null;
  latitud?: number | null;
  longitud?: number | null;
}

export interface CreateContractWithMeterCommand extends ContractProcedureData {
  registradoPorId?: number;
  clienteId: bigint;
  categoriaTarifaId: number;
  medidorId: bigint;
  direccionSuministro: string;
  estadoServicio: EstadoServicioContrato;
  estadoCobranza: EstadoCobranzaContrato;
  creadoPor?: string;
  comunidadId: number;
  sectorId: number | null;
  lecturaInicial: number;
  latitud?: number | null;
  longitud?: number | null;
}

export type UpdateContractData = Partial<
  Omit<CreateContractData, 'numeroGuia'>
> & {
  medidorId?: bigint;
  lecturaInicial?: number;
};
