import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type { PeriodFilters } from '../../domain/types/period.types';
import type { PeriodEntity } from '../../domain/entities/period.entity';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class FindAllPeriodsUseCase {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async execute(
    filters?: PeriodFilters,
    pagination?: PaginateOptions,
  ): Promise<PaginatedResult<PeriodEntity>> {
    return this.periodRepository.findAll(filters, pagination);
  }
}
