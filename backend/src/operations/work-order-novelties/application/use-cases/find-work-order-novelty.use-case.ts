import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../../domain/repositories/work-order-novelty.repository';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';

@Injectable()
export class FindWorkOrderNoveltyUseCase {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
  ) {}

  async execute(id: bigint): Promise<WorkOrderNoveltyEntity> {
    const novelty = await this.repository.findById(id);
    if (!novelty) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }
    return novelty;
  }
}
