import type { ContractEntity } from '../entities/contract.entity';
import type {
  CreateContractData,
  CreateContractWithMeterCommand,
  ContractFilters,
  UpdateContractData,
} from '../types/contract.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

export abstract class ContractRepository {
  abstract findById(
    contratoId: bigint,
    includeDeleted?: boolean,
  ): Promise<ContractEntity | null>;

  abstract paginateContratos(
    args: {
      filters?: ContractFilters;
      orderBy?: { [key: string]: 'asc' | 'desc' };
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ContractEntity>>;

  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Partial<ContractFilters>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<ContractEntity[]>;

  abstract findUnique(where: {
    contratoId?: bigint;
    numeroGuia?: string;
  }): Promise<ContractEntity | null>;

  abstract count(params?: {
    where?: Partial<ContractFilters>;
  }): Promise<number>;

  abstract update(
    contratoId: bigint,
    data: UpdateContractData,
  ): Promise<ContractEntity>;

  abstract create(data: CreateContractData): Promise<ContractEntity>;

  abstract softDelete(contratoId: bigint): Promise<ContractEntity>;

  // ── Domain-level transactional operations ──────────────────────────────

  abstract createContractWithMeterHistory(
    data: CreateContractWithMeterCommand,
  ): Promise<ContractEntity>;

  abstract finalizeActiveMeterLink(contratoId: bigint): Promise<ContractEntity>;
}
