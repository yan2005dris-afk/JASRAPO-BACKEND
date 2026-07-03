import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { SRI_BUCKETS } from '../storage/storage.service';

const PDF_RETENTION_DAYS = Number(process.env['PDF_RETENTION_DAYS']) || 90;
const PDF_CLEANUP_INTERVAL_MS =
  Number(process.env['PDF_CLEANUP_INTERVAL_MS']) || 24 * 60 * 60 * 1000;

/**
 * Cron-style service that periodically cleans up old PDF attachments
 * from S3. Files are keyed under `planillas/<periodo>/<timestamp>-<name>.pdf`
 * where `<timestamp>` is `Date.now()` at upload time.
 *
 * The service parses the timestamp from the key name to determine file age,
 * avoiding an S3 HEAD request per file. Files older than `PDF_RETENTION_DAYS`
 * (default 90) are deleted.
 */
@Injectable()
export class PdfAttachmentCleanupService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PdfAttachmentCleanupService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly retentionDays = Math.max(1, PDF_RETENTION_DAYS);
  private readonly bucket = SRI_BUCKETS.PDFS;
  private readonly prefix = 'planillas/';

  constructor(private readonly storageService: StorageService) {}

  onApplicationBootstrap(): void {
    // Run once at startup, then every interval
    this.cleanup();
    this.timer = setInterval(() => this.cleanup(), PDF_CLEANUP_INTERVAL_MS);
    this.logger.log(
      `PDF attachment cleanup scheduled every ${PDF_CLEANUP_INTERVAL_MS / 1000 / 60}m (retention: ${this.retentionDays}d)`,
    );
  }

  onApplicationShutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async cleanup(): Promise<void> {
    try {
      const files = await this.storageService.list(this.bucket, this.prefix);
      const cutoffMs = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;

      let deleted = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const key of files) {
        const fileTimestamp = this.extractTimestamp(key);
        if (fileTimestamp === null) {
          skipped++;
          continue;
        }

        if (fileTimestamp < cutoffMs) {
          try {
            await this.storageService.delete(this.bucket, key);
            deleted++;
            this.logger.debug(`Deleted stale attachment: ${key}`);
          } catch (err) {
            errors.push(key);
            this.logger.warn(
              `Failed to delete ${key}: ${(err as Error).message}`,
            );
          }
        } else {
          skipped++;
        }
      }

      this.logger.log(
        `Attachment cleanup complete: ${deleted} deleted, ${skipped} skipped` +
          (errors.length > 0 ? `, ${errors.length} errors` : ''),
      );
    } catch (err) {
      this.logger.error(
        `Attachment cleanup failed: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Extracts the upload timestamp (epoch ms) from the S3 key.
   * Key format: planillas/<periodoSlug>/<timestamp>-<safeName>.pdf
   */
  private extractTimestamp(key: string): number | null {
    // Match the last sequence of digits before a hyphen and .pdf
    const match = key.match(/(\d+)-[^/]+\.pdf$/);
    if (!match) return null;
    const ts = parseInt(match[1], 10);
    return Number.isFinite(ts) && ts > 0 ? ts : null;
  }
}
