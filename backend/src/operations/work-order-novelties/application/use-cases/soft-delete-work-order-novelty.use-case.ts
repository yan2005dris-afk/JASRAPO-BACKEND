import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../../domain/repositories/work-order-novelty.repository';
import type { WorkOrderNoveltyRow } from '../../infrastructure/repositories/work-order-novelty.include';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { NoveltyEvidenceQueueService } from '../../infrastructure/novelty-evidence-queue.service';
import { FindWorkOrderNoveltyUseCase } from './find-work-order-novelty.use-case';

/**
 * Soft-deletes a novelty and enqueues an evidence cleanup job.
 *
 * Sequence: DB soft-delete FIRST, then enqueue pg-boss job for the storage
 * delete. The job runs within seconds and retries with exponential backoff
 * (5 attempts, up to 10min). If pg-boss is down at enqueue time, the soft
 * delete still succeeds and the warn is logged.
 */
@Injectable()
export class SoftDeleteWorkOrderNoveltyUseCase {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
    private readonly findUseCase: FindWorkOrderNoveltyUseCase,
    private readonly evidenceQueue: NoveltyEvidenceQueueService,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    id: bigint,
    actorUserId?: number,
  ): Promise<WorkOrderNoveltyRow> {
    const existing = await this.findUseCase.execute(id);
    if (existing.deletedAt) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }

    const softDeleted = await this.repository.softDelete(id, new Date());

    if (existing.fotoUrl) {
      try {
        await this.evidenceQueue.enqueueCleanup(
          softDeleted.novedadId,
          existing.fotoUrl,
        );
        this.logger.debug(
          `[WORK-ORDER-NOVELTY] evidence_cleanup outcome=enqueued novedad=${softDeleted.novedadId} key=${existing.fotoUrl} actor=${actorUserId ?? 'system'}`,
        );
      } catch (error) {
        this.logger.warn(
          `[WORK-ORDER-NOVELTY] evidence_cleanup outcome=enqueue_failed novedad=${softDeleted.novedadId} key=${existing.fotoUrl} actor=${actorUserId ?? 'system'} error=${(error as Error).message}`,
        );
      }
    }

    return softDeleted;
  }
}
