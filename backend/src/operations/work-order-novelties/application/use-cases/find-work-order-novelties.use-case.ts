import { Inject, Injectable } from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
  type WorkOrderNoveltyFilters,
} from '../../domain/repositories/work-order-novelty.repository';

@Injectable()
export class FindWorkOrderNoveltiesUseCase {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
  ) {}

  execute(filters: WorkOrderNoveltyFilters) {
    return this.repository.findMany(filters);
  }
}
