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

export interface ContractInstallationAssignmentRef {
  rutaId: bigint;
  nombreRuta: string;
  estadoRuta: string;
  ordenTrabajoId: bigint;
  estadoOrdenTrabajo: string;
  fechaPlanificada: Date | null;
  operarioNombre: string | null;
}

export class ContractEntity {
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

  categoriaTarifa?: ContractTariffCategoryRef | null;
  cliente?: ContractClientRef | null;
  comunidad?: ContractCommunityRef | null;
  sector?: ContractSectorRef | null;
  historialMedidores?: ContractMeterHistoryRef[] | null;
  asignacionInstalacion?: ContractInstallationAssignmentRef | null;

  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ContractEntity>) {
    Object.assign(this, partial);
  }
}
