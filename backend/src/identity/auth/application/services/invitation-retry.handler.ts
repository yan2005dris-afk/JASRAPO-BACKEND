import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobsService } from 'src/infrastructure/jobs/jobs.service';
import { InvitationRetryService } from './invitation-retry.service';

const QUEUE_NAME = 'retry-invitations';
const CRON_PATTERN = '0 */30 * * * *'; // Cada 30 minutos

@Injectable()
export class InvitationRetryHandler implements OnModuleInit {
  private readonly logger = new Logger(InvitationRetryHandler.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly retryService: InvitationRetryService,
  ) {}

  async onModuleInit() {
    try {
      // Registrar worker
      await this.jobsService.work(QUEUE_NAME, async () => {
        this.logger.debug(`[${QUEUE_NAME}] Worker started`);
        const stats = await this.retryService.retryFailedInvitations();
        this.logger.log(`[${QUEUE_NAME}] Completed: ${JSON.stringify(stats)}`);
        return stats;
      });

      // Programar ejecución periódica
      await this.jobsService.schedule(QUEUE_NAME, CRON_PATTERN, {});
      this.logger.log(
        `[${QUEUE_NAME}] Scheduled with cron: "${CRON_PATTERN}" (every 30 minutes)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize invitation retry handler: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}