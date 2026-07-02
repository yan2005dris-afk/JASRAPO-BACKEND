import type { ContractEntity } from '../entities/contract.entity';
import type { CreateContractData } from '../types/create-contract-data';
import type { CreateContractWithMeterCommand } from '../types/create-contract-with-meter-command';
import type { ContractFilters } from '../types/contract-filters';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

export abstract class ContractRepository {
  abstract paginateContratos(
    args: {
      filters?: ContractFilters;
      orderBy?: Record<string, any>;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ContractEntity>>;

  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<ContractEntity[]>;

  abstract findUnique(
    where: Record<string, any>,
  ): Promise<ContractEntity | null>;

  abstract count(params: { where?: Record<string, any> }): Promise<number>;

  abstract update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<ContractEntity>;

  abstract create(data: CreateContractData): Promise<ContractEntity>;

  // ── Domain-level transactional operations ──────────────────────────────

  abstract createContractWithMeterHistory(
    data: CreateContractWithMeterCommand,
  ): Promise<ContractEntity>;

  abstract replaceMeterInContract(
    contractId: bigint,
    newMeterId: bigint,
    lecturaInicial: number,
    contractFields?: Record<string, any>,
  ): Promise<ContractEntity>;

  abstract finalizeActiveMeterLink(contratoId: bigint): Promise<ContractEntity>;
}
