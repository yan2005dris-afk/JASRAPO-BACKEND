import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type { PeriodFilters, PeriodRow } from '../../domain/types/period.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

@Injectable()
export class FindAllPeriodsUseCase {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async execute(
    filters?: PeriodFilters,
    pagination?: PaginateOptions,
  ): Promise<PaginatedResult<PeriodRow>> {
    return this.periodRepository.findAll(filters, pagination);
  }
}
