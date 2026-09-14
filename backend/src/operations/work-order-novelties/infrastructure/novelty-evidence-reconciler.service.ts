import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../domain/repositories/work-order-novelty.repository';
import {
  SRI_STORAGE_TYPES,
  StorageService,
} from 'src/infrastructure/storage/storage.service';

const DEFAULT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

const envInterval = Number(process.env['NOVELTY_EVIDENCE_RECONCILER_MS']);
const INTERVAL_MS =
  Number.isFinite(envInterval) && envInterval > 0
    ? envInterval
    : DEFAULT_INTERVAL_MS;

const DEFAULT_BATCH_SIZE = 50;
const envBatch = Number(process.env['NOVELTY_EVIDENCE_RECONCILER_BATCH']);
const BATCH_SIZE =
  Number.isFinite(envBatch) && envBatch > 0 ? envBatch : DEFAULT_BATCH_SIZE;

/**
 * Safety-net reconciler for evidence orphaned before the pg-boss queue was
 * introduced (or while it was unavailable).
 *
 * The PRIMARY cleanup path is now pg-boss-driven (see
 * NoveltyEvidenceQueueService) — when softDelete() runs, it enqueues a job
 * that fires within seconds and clears the dangling fotoUrl reference.
 *
 * This reconciler exists only to clean up evidence that became orphaned
 * before the queue was wired up, or during a pg-boss outage. It runs weekly
 * by default, processes batches of 50, and stops as soon as no candidates
 * remain (so it self-throttles after the backlog is drained).
 *
 * Tunable via env:
 *   - NOVELTY_EVIDENCE_RECONCILER_MS (default 604800000 = 7d)
 *   - NOVELTY_EVIDENCE_RECONCILER_BATCH (default 50)
 *
 * Disable with NOVELTY_EVIDENCE_RECONCILER_MS=0.
 */
@Injectable()
export class NoveltyEvidenceReconcilerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new ConsoleLogger(
    NoveltyEvidenceReconcilerService.name,
  );
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
    private readonly storageService: StorageService,
  ) {}

  onApplicationBootstrap(): void {
    if (INTERVAL_MS <= 0) {
      this.logger.log('Novelty evidence reconciler disabled (interval <= 0)');
      return;
    }
    this.reconcile().catch((err) =>
      this.logger.error('Initial novelty evidence reconcile failed', err),
    );
    this.timer = setInterval(() => {
      this.reconcile().catch((err) =>
        this.logger.error('Scheduled novelty evidence reconcile failed', err),
      );
    }, INTERVAL_MS);
    this.logger.log(
      `Novelty evidence reconciler scheduled every ${INTERVAL_MS / 1000}s (batch=${BATCH_SIZE})`,
    );
  }

  onApplicationShutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Public for ad-hoc invocation (tests, manual triggers, ops scripts).
   */
  async reconcile(): Promise<{
    inspected: number;
    cleared: number;
    failed: number;
  }> {
    let inspected = 0;
    let cleared = 0;
    let failed = 0;

    try {
      const candidates =
        await this.repository.findSoftDeletedWithEvidence(BATCH_SIZE);
      inspected = candidates.length;
      if (inspected === 0) {
        return { inspected, cleared, failed };
      }

      for (const novelty of candidates) {
        const key = novelty.fotoUrl;
        if (!key) continue;
        try {
          await this.storageService.delete(SRI_STORAGE_TYPES.READING_NEWS, key);
          await this.repository.clearEvidenceReference(novelty.novedadId);
          cleared++;
          this.logger.debug(
            `[NOVELTY-EVIDENCE-RECONCILER] outcome=cleared novedad=${novedadIdString(novelty.novedadId)} key=${key}`,
          );
        } catch (err) {
          failed++;
          this.logger.warn(
            `[NOVELTY-EVIDENCE-RECONCILER] outcome=failed novedad=${novedadIdString(novelty.novedadId)} key=${key} error=${(err as Error).message}`,
          );
        }
      }

      this.logger.log(
        `Novelty evidence reconcile complete: ${cleared} cleared, ${failed} failed (inspected=${inspected})`,
      );
    } catch (err) {
      this.logger.error(
        `Novelty evidence reconcile cycle failed: ${(err as Error).message}`,
      );
    }

    return { inspected, cleared, failed };
  }
}

function novedadIdString(id: bigint): string {
  return id.toString();
}
