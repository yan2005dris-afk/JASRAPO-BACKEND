import type { BatchEntity } from '../entities/batch.entity';
import type { BatchFilters, GenerateBatchData } from '../types/batch.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

export abstract class BatchRepository {
  abstract paginate(
    pagination: PaginateOptions,
    filters?: BatchFilters,
  ): Promise<PaginatedResult<BatchEntity>>;

  abstract findById(id: number | bigint): Promise<BatchEntity | null>;

  abstract count(filters?: BatchFilters): Promise<number>;

  abstract generate(data: GenerateBatchData): Promise<bigint | null>;
}
