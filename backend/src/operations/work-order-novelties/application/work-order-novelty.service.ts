import { Injectable } from '@nestjs/common';
import { CreateWorkOrderNoveltyUseCase } from './use-cases/create-work-order-novelty.use-case';
import { FindWorkOrderNoveltyUseCase } from './use-cases/find-work-order-novelty.use-case';
import { FindWorkOrderNoveltiesUseCase } from './use-cases/find-work-order-novelties.use-case';
import { UpdateWorkOrderNoveltyUseCase } from './use-cases/update-work-order-novelty.use-case';
import { SoftDeleteWorkOrderNoveltyUseCase } from './use-cases/soft-delete-work-order-novelty.use-case';
import type { CreateWorkOrderNoveltyInput } from './use-cases/create-work-order-novelty.use-case';
import type { UpdateWorkOrderNoveltyInput } from './use-cases/update-work-order-novelty.use-case';
import type { WorkOrderNoveltyFilters } from '../domain/repositories/work-order-novelty.repository';
import type { WorkOrderNoveltyRow } from '../infrastructure/repositories/work-order-novelty.include';

export type { CreateWorkOrderNoveltyInput, UpdateWorkOrderNoveltyInput };

/**
 * Principal facade for the work-order novelties module. Delegates each
 * operation to its dedicated use case; the service itself holds no business
 * logic. This mirrors the `ClientService` / `*UseCase` pattern used in the
 * other operations/* modules.
 */
@Injectable()
export class WorkOrderNoveltyService {
  constructor(
    private readonly createUseCase: CreateWorkOrderNoveltyUseCase,
    private readonly findUseCase: FindWorkOrderNoveltyUseCase,
    private readonly findAllUseCase: FindWorkOrderNoveltiesUseCase,
    private readonly updateUseCase: UpdateWorkOrderNoveltyUseCase,
    private readonly softDeleteUseCase: SoftDeleteWorkOrderNoveltyUseCase,
  ) {}

  create(
    dto: CreateWorkOrderNoveltyInput,
    file?: Express.Multer.File,
  ): Promise<WorkOrderNoveltyRow> {
    return this.createUseCase.execute(dto, file);
  }

  findById(id: bigint): Promise<WorkOrderNoveltyRow> {
    return this.findUseCase.execute(id);
  }

  findAll(filters: WorkOrderNoveltyFilters) {
    return this.findAllUseCase.execute(filters);
  }

  update(
    id: bigint,
    dto: UpdateWorkOrderNoveltyInput,
    file?: Express.Multer.File,
    actorUserId?: number,
  ): Promise<WorkOrderNoveltyRow> {
    return this.updateUseCase.execute(id, dto, file, actorUserId);
  }

  softDelete(id: bigint, actorUserId?: number): Promise<WorkOrderNoveltyRow> {
    return this.softDeleteUseCase.execute(id, actorUserId);
  }
}
