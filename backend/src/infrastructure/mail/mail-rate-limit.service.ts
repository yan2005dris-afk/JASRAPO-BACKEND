import { Injectable, Logger } from '@nestjs/common';
import { RawPgService } from '../database/raw-pg/raw-pg.service';

const ACQUIRE_SLOT_SQL = `
  INSERT INTO mail_provider_daily_counts (provider_name, usage_date, sent_count)
  VALUES ($1, CURRENT_DATE, 1)
  ON CONFLICT (provider_name, usage_date)
  DO UPDATE SET sent_count = mail_provider_daily_counts.sent_count + 1
  WHERE mail_provider_daily_counts.sent_count < $2
  RETURNING sent_count
`;

const RELEASE_SLOT_SQL = `
  UPDATE mail_provider_daily_counts
  SET sent_count = GREATEST(sent_count - 1, 0)
  WHERE provider_name = $1
    AND usage_date = CURRENT_DATE
  RETURNING sent_count
`;

@Injectable()
export class MailRateLimitService {
  private readonly logger = new Logger(MailRateLimitService.name);

  constructor(private readonly rawPg: RawPgService) {}

  async tryAcquire(providerName: string, maxPerDay: number): Promise<boolean> {
    try {
      const row = await this.rawPg.queryOne<{ sent_count: number }>(
        ACQUIRE_SLOT_SQL,
        [providerName, maxPerDay],
      );
      return row !== null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.warn(
        `No se pudo aplicar rate limit para ${providerName}, se permite el envío: ${message}`,
      );
      return true;
    }
  }

  async release(providerName: string): Promise<void> {
    try {
      await this.rawPg.query(RELEASE_SLOT_SQL, [providerName]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.warn(
        `No se pudo liberar cupo de rate limit para ${providerName}: ${message}`,
      );
    }
  }
}
