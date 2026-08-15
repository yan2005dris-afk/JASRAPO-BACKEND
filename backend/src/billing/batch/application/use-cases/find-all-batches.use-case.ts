import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { BatchEntity } from '../../domain/entities/batch.entity';
import type { BatchFilters } from '../../domain/types/batch.types';

@Injectable()
export class FindAllBatchesUseCase {
  constructor(private readonly batchRepository: BatchRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    filters?: BatchFilters,
  ): Promise<PaginatedResult<BatchEntity>> {
    return this.batchRepository.paginate({ page, limit }, filters);
  }
}
