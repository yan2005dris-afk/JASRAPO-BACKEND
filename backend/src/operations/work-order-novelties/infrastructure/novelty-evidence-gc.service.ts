import {
  ConsoleLogger,
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../domain/repositories/work-order-novelty.repository';
import {
  SRI_STORAGE_TYPES,
  StorageService,
} from 'src/infrastructure/storage/storage.service';

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000; // 1 hora
const DEFAULT_BATCH_SIZE = 50;

const envInterval = Number(process.env['NOVELTY_EVIDENCE_GC_INTERVAL_MS']);
const envBatch = Number(process.env['NOVELTY_EVIDENCE_GC_BATCH_SIZE']);
const INTERVAL_MS =
  Number.isFinite(envInterval) && envInterval > 0
    ? envInterval
    : DEFAULT_INTERVAL_MS;
const BATCH_SIZE =
  Number.isFinite(envBatch) && envBatch > 0 ? envBatch : DEFAULT_BATCH_SIZE;

/**
 * Reconciles orphaned evidence in the S3 bucket against soft-deleted novelties.
 *
 * Background:
 *   `WorkOrderNoveltyService.softDelete()` does a DB-first soft delete and then
 *   best-effort deletes the evidence from storage. If the storage call fails,
 *   the soft-deleted row keeps its `fotoUrl`, leaving an orphan in the bucket.
 *
 * This job periodically scans for soft-deleted rows that still reference a
 * `fotoUrl`, attempts the storage delete, and clears the dangling reference on
 * success. Idempotent — safe to run as often as desired.
 *
 * Tunable via env:
 *   - NOVELTY_EVIDENCE_GC_INTERVAL_MS (default 3600000 = 1h)
 *   - NOVELTY_EVIDENCE_GC_BATCH_SIZE (default 50)
 *
 * Disable at runtime by setting NOVELTY_EVIDENCE_GC_INTERVAL_MS=0 (the service
 * still registers so DI is consistent, but it never schedules a tick).
 */
@Injectable()
export class NoveltyEvidenceGcService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new ConsoleLogger(NoveltyEvidenceGcService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
    private readonly storageService: StorageService,
  ) {}

  onApplicationBootstrap(): void {
    if (INTERVAL_MS <= 0) {
      this.logger.log('Novelty evidence GC disabled (interval <= 0)');
      return;
    }
    // Run once at startup, then on each interval.
    this.reconcile().catch((err) =>
      this.logger.error('Initial novelty evidence GC failed', err),
    );
    this.timer = setInterval(() => {
      this.reconcile().catch((err) =>
        this.logger.error('Scheduled novelty evidence GC failed', err),
      );
    }, INTERVAL_MS);
    this.logger.log(
      `Novelty evidence GC scheduled every ${INTERVAL_MS / 1000}s (batch=${BATCH_SIZE})`,
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
   * Returns a summary so callers can decide whether to re-run immediately.
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
            `[NOVELTY-EVIDENCE-GC] outcome=cleared novedad=${novedadIdString(novelty.novedadId)} key=${key}`,
          );
        } catch (err) {
          failed++;
          this.logger.warn(
            `[NOVELTY-EVIDENCE-GC] outcome=failed novedad=${novedadIdString(novelty.novedadId)} key=${key} error=${(err as Error).message}`,
          );
        }
      }

      this.logger.log(
        `Novelty evidence GC complete: ${cleared} cleared, ${failed} failed (inspected=${inspected})`,
      );
    } catch (err) {
      this.logger.error(
        `Novelty evidence GC cycle failed: ${(err as Error).message}`,
      );
    }

    return { inspected, cleared, failed };
  }
}

function novedadIdString(id: bigint): string {
  return id.toString();
}
