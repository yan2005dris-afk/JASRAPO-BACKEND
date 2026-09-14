import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../domain/repositories/work-order-novelty.repository';
import {
  SRI_STORAGE_TYPES,
  StorageService,
} from 'src/infrastructure/storage/storage.service';
import { JobsService } from 'src/infrastructure/jobs/jobs.service';

export const NOVELTY_EVIDENCE_CLEANUP_JOB = 'cleanup-novedad-evidence';

export interface NoveltyEvidenceCleanupJob {
  novedadId: number;
  fotoUrl: string;
}

/**
 * Pushes evidence cleanup jobs onto pg-boss (PostgreSQL-backed queue).
 *
 * Why pg-boss:
 *   - Already wired up in the repo (see infrastructure/jobs).
 *   - PostgreSQL is the only infra needed; no Redis/RabbitMQ/Kafka.
 *   - Built-in retry with exponential backoff.
 *
 * Flow:
 *   WorkOrderNoveltyService.softDelete()
 *     → enqueueCleanup(novedadId, fotoUrl)
 *     → pg-boss stores the job in `jobs` schema
 *     → work() handler picks it up
 *     → storageService.delete()
 *     → repository.clearEvidenceReference()
 *
 * If pg-boss is down at enqueue time, the soft delete still succeeds and the
 * warn is logged. The orphan remains in the bucket until pg-boss recovers
 * and the job is retried (5 attempts with exponential backoff up to 10min).
 */
@Injectable()
export class NoveltyEvidenceQueueService implements OnApplicationBootstrap {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
    private readonly storageService: StorageService,
    private readonly jobsService: JobsService,
  ) {}

  /**
   * Registers the worker. Called once on application bootstrap.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.jobsService.work(NOVELTY_EVIDENCE_CLEANUP_JOB, async ([job]) => {
      if (!job) return;
      await this.process(job.data as NoveltyEvidenceCleanupJob);
    });
  }

  /**
   * Enqueues a cleanup job for the given novelty. Safe to call even if
   * `fotoUrl` is null (the job simply does nothing when the worker reads it).
   */
  async enqueueCleanup(
    novedadId: bigint,
    fotoUrl: string | null,
  ): Promise<void> {
    if (!fotoUrl) return;
    await this.jobsService.send(
      NOVELTY_EVIDENCE_CLEANUP_JOB,
      {
        novedadId: Number(novedadId),
        fotoUrl,
      },
      {
        retryLimit: 5,
        retryDelay: 10,
        retryDelayMax: 600,
        retryBackoff: true,
      },
    );
  }

  private async process(data: NoveltyEvidenceCleanupJob): Promise<void> {
    await this.storageService.delete(
      SRI_STORAGE_TYPES.READING_NEWS,
      data.fotoUrl,
    );
    await this.repository.clearEvidenceReference(BigInt(data.novedadId));
  }
}
