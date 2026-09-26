import type { PeriodEntity } from '../entities/period.entity';
import type {
  CreatePeriodData,
  UpdatePeriodData,
  PeriodFilters,
  PeriodRelationCounts,
} from '../types/period.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

export abstract class PeriodRepository {
  abstract create(data: CreatePeriodData): Promise<PeriodEntity>;

  abstract findAll(
    filters?: PeriodFilters,
    pagination?: PaginateOptions,
  ): Promise<PaginatedResult<PeriodEntity>>;

  abstract findById(id: number): Promise<PeriodEntity | null>;

  abstract findByName(nombre: string): Promise<PeriodEntity | null>;

  abstract findByNames(nombres: string[]): Promise<PeriodEntity[]>;

  abstract createBatch(data: CreatePeriodData[]): Promise<PeriodEntity[]>;

  abstract update(id: number, data: UpdatePeriodData): Promise<PeriodEntity>;

  abstract delete(id: number): Promise<PeriodEntity>;

  abstract countRelations(id: number): Promise<PeriodRelationCounts>;
}
