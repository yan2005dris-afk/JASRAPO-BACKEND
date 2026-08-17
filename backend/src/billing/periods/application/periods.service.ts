import { Injectable } from '@nestjs/common';
import { CreatePeriodUseCase } from './use-cases/create-period.use-case';
import { FindAllPeriodsUseCase } from './use-cases/find-all-periods.use-case';
import { FindOnePeriodUseCase } from './use-cases/find-one-period.use-case';
import { UpdatePeriodUseCase } from './use-cases/update-period.use-case';
import { DeletePeriodUseCase } from './use-cases/delete-period.use-case';
import type {
  CreatePeriodData,
  UpdatePeriodData,
  PeriodFilters,
} from '../domain/types/period.types';
import type { PeriodEntity } from '../domain/entities/period.entity';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class PeriodsService {
  constructor(
    private readonly createPeriodUseCase: CreatePeriodUseCase,
    private readonly findAllPeriodsUseCase: FindAllPeriodsUseCase,
    private readonly findOnePeriodUseCase: FindOnePeriodUseCase,
    private readonly updatePeriodUseCase: UpdatePeriodUseCase,
    private readonly deletePeriodUseCase: DeletePeriodUseCase,
  ) {}

  async create(data: CreatePeriodData): Promise<PeriodEntity> {
    return this.createPeriodUseCase.execute(data);
  }

  async findAll(
    filters?: PeriodFilters,
    pagination?: PaginateOptions,
  ): Promise<PaginatedResult<PeriodEntity>> {
    return this.findAllPeriodsUseCase.execute(filters, pagination);
  }

  async findOne(id: number): Promise<PeriodEntity> {
    return this.findOnePeriodUseCase.execute(id);
  }

  async update(id: number, data: UpdatePeriodData): Promise<PeriodEntity> {
    return this.updatePeriodUseCase.execute(id, data);
  }

  async delete(id: number): Promise<PeriodEntity> {
    return this.deletePeriodUseCase.execute(id);
  }
}
