import type { ContractEntity } from '../entities/contract.entity';
import type { CreateContractData } from '../types/create-contract-data';
import type { CreateContractWithMeterCommand } from '../types/create-contract-with-meter-command';
import type { ContractFilters } from '../types/contract-filters';
import type { UpdateContractData } from '../types/update-contract-data';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
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

  abstract findUnique(
    where: { contratoId?: bigint; numeroGuia?: string },
  ): Promise<ContractEntity | null>;

  abstract count(params?: { where?: Partial<ContractFilters> }): Promise<number>;

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

  abstract replaceMeterInContract(
    contractId: bigint,
    newMeterId: bigint,
    lecturaInicial: number,
    contractFields?: Partial<CreateContractData>,
  ): Promise<ContractEntity>;

  abstract finalizeActiveMeterLink(contratoId: bigint): Promise<ContractEntity>;
}
