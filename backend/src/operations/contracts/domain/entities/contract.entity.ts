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
