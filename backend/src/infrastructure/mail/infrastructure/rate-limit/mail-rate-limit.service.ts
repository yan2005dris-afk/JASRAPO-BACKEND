import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../database/prisma.service';

const ACQUIRE_SLOT_SQL = `
  INSERT INTO mail_provider_daily_counts (provider_name, usage_date, sent_count)
  VALUES ($1, CURRENT_DATE, 1)
  ON CONFLICT (provider_name, usage_date)
  DO UPDATE SET sent_count = mail_provider_daily_counts.sent_count + 1
  WHERE mail_provider_daily_counts.sent_count < $2
  RETURNING sent_count
`;

@Injectable()
export class MailRateLimitService {
  private readonly logger = new Logger(MailRateLimitService.name);

  constructor(private readonly prisma: PrismaService) {}

  async tryAcquire(providerName: string, maxPerDay: number): Promise<boolean> {
    if (maxPerDay <= 0) {
      return false;
    }

    try {
      const rows = await this.prisma.$queryRawUnsafe<{ sent_count: number }[]>(
        ACQUIRE_SLOT_SQL,
        providerName,
        maxPerDay,
      );
      return rows.length > 0;
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
      await this.prisma.$queryRaw(Prisma.sql`
        UPDATE mail_provider_daily_counts
        SET sent_count = GREATEST(sent_count - 1, 0)
        WHERE provider_name = ${providerName}
          AND usage_date = CURRENT_DATE
        RETURNING sent_count
      `);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.warn(
        `No se pudo liberar cupo de rate limit para ${providerName}: ${message}`,
      );
    }
  }
}
