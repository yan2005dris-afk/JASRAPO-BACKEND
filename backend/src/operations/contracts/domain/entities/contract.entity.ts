import type { ContractProcedureData } from '../contract-procedure';
import type {
  ContractTariffCategoryRef,
  ContractClientRef,
  ContractCommunityRef,
  ContractSectorRef,
  ContractMeterHistoryRef,
} from '../types/contract-relations';
import type {
  EstadoCobranzaContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';

export class ContractEntity implements ContractProcedureData {
  tramitadorEsTitular?: boolean | null;
  tramitadorNombre?: string | null;
  tramitadorIdentificacion?: string | null;
  relacionTramitador?: string | null;
  observacionesTramite?: string | null;
  otrasNovedades?: string | null;
  registradoPorId?: number | null;
  contratoId: bigint;
  clienteId: bigint;
  sectorId: number | null;
  categoriaTarifaId: number;
  numeroGuia: string;
  fechaInicio: Date;
  direccionSuministro: string;
  estadoServicio: EstadoServicioContrato;
  estadoCobranza: EstadoCobranzaContrato;
  tieneConvenioActivo: boolean;
  creadoPor: string | null;
  comunidadId: number;
  latitud: number | null;
  longitud: number | null;

  categoriaTarifa?: ContractTariffCategoryRef | null;
  cliente?: ContractClientRef | null;
  comunidad?: ContractCommunityRef | null;
  sector?: ContractSectorRef | null;
  historialMedidores?: ContractMeterHistoryRef[] | null;

  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ContractEntity>) {
    Object.assign(this, partial);
  }
}
