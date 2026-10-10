import type { ContractRow } from '../../infrastructure/repositories/contract.include';
import type {
  CreateContractData,
  CreateContractWithMeterCommand,
  ContractFilters,
  UpdateContractData,
} from '../types/contract.types';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';

export abstract class ContractRepository {
  abstract findById(
    contratoId: bigint,
    includeDeleted?: boolean,
  ): Promise<ContractRow | null>;

  abstract paginateContratos(
    args: {
      filters?: ContractFilters;
      orderBy?: { [key: string]: 'asc' | 'desc' };
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ContractRow>>;
  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Partial<ContractFilters>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<ContractRow[]>;

  abstract findUnique(where: {
    contratoId?: bigint;
    numeroGuia?: string;
  }): Promise<ContractRow | null>;

  abstract count(params?: {
    where?: Partial<ContractFilters>;
  }): Promise<number>;

  abstract update(
    contratoId: bigint,
    data: UpdateContractData,
  ): Promise<ContractRow>;

  abstract create(data: CreateContractData): Promise<ContractRow>;

  abstract softDelete(contratoId: bigint): Promise<ContractRow>;

  // ── Domain-level transactional operations ──────────────────────────────

  abstract createContractWithMeterHistory(
    data: CreateContractWithMeterCommand,
  ): Promise<ContractRow>;

  abstract finalizeActiveMeterLink(contratoId: bigint): Promise<ContractRow>;

  // ── Connection-request tariff costs (SC-275) ───────────────────────────
  // Costs are sourced from `rubros` instead of being hardcoded in the use case.
  abstract getConnectionCosts(categoriaTarifaId: number): Promise<{
    costoGuia: number | null;
    derechoInspeccion: number | null;
  }>;
}
