import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { ContractEntity } from '../../domain/entities/contract.entity';
import type { ContractFilters } from '../../domain/types/contract-filters';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    page = 1,
    limit = 10,
    filters?: ContractFilters,
  ): Promise<PaginatedResult<ContractEntity>> {
    return this.contractRepository.paginateContratos(
      { filters, orderBy: { createdAt: 'desc' } },
      { page, limit },
    );
  }
}
