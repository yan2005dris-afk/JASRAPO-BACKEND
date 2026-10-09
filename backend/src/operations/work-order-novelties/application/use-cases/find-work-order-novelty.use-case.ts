import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../../domain/repositories/work-order-novelty.repository';
import type { WorkOrderNoveltyRow } from '../../infrastructure/repositories/work-order-novelty.include';

@Injectable()
export class FindWorkOrderNoveltyUseCase {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
  ) {}

  async execute(id: bigint): Promise<WorkOrderNoveltyRow> {
    const novelty = await this.repository.findById(id);
    if (!novelty) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }
    return novelty;
  }
}
