import type {
  ContractTariffCategoryRef,
  ContractClientRef,
  ContractCommunityRef,
  ContractSectorRef,
  ContractMeterHistoryRef,
} from '../types/contract-relations';

export class ContractEntity {
  contratoId: bigint;
  clienteId: bigint;
  sectorId: number | null;
  categoriaTarifaId: number;
  numeroGuia: string;
  fechaInicio: Date;
  direccionSuministro: string;
  estado: string;
  creadoPor: string | null;
  comunidadId: number;

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
