import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { ContractRow } from '../../infrastructure/repositories/contract.include';
import type { ContractFilters } from '../../domain/types/contract.types';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    page = 1,
    limit = 10,
    filters?: ContractFilters,
  ): Promise<PaginatedResult<ContractRow>> {
    return this.contractRepository.paginateContratos(
      { filters, orderBy: { createdAt: 'desc' } },
      { page, limit },
    );
  }
}
