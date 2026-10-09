import type { BatchRow } from '../types/batch.types';
import type { BatchFilters, GenerateBatchData } from '../types/batch.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

export abstract class BatchRepository {
  abstract paginate(
    pagination: PaginateOptions,
    filters?: BatchFilters,
  ): Promise<PaginatedResult<BatchRow>>;

  abstract findById(id: number | bigint): Promise<BatchRow | null>;

  abstract count(filters?: BatchFilters): Promise<number>;

  abstract generate(data: GenerateBatchData): Promise<bigint | null>;
}
