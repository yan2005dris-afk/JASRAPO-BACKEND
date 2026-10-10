import type { PeriodRow } from '../types/period.types';
import type {
  CreatePeriodData,
  UpdatePeriodData,
  PeriodFilters,
  PeriodRelationCounts,
} from '../types/period.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

export abstract class PeriodRepository {
  abstract create(data: CreatePeriodData): Promise<PeriodRow>;

  abstract findAll(
    filters?: PeriodFilters,
    pagination?: PaginateOptions,
  ): Promise<PaginatedResult<PeriodRow>>;

  abstract findById(id: number): Promise<PeriodRow | null>;

  abstract findByName(nombre: string): Promise<PeriodRow | null>;

  abstract findByNames(nombres: string[]): Promise<PeriodRow[]>;

  abstract findOverlapping(
    fechaInicio: Date,
    fechaFin: Date,
    excludeId?: number,
  ): Promise<PeriodRow | null>;

  abstract createBatch(data: CreatePeriodData[]): Promise<PeriodRow[]>;

  abstract update(id: number, data: UpdatePeriodData): Promise<PeriodRow>;

  abstract delete(id: number): Promise<PeriodRow>;

  abstract countRelations(id: number): Promise<PeriodRelationCounts>;
}
