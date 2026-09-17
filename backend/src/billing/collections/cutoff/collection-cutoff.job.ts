import { Injectable, OnModuleInit } from '@nestjs/common';
import { JobsService } from 'src/infrastructure/jobs/jobs.service';
import { CollectionCutoffService } from './collection-cutoff.service';

export const COLLECTION_CUTOFF_JOB = 'collection-cutoff-daily-evaluation';
// pg-boss cron expressions run in UTC. Ecuador has no DST and is UTC-5, so
// 05:00 UTC is 00:00 on the configured Ecuador calendar day.
export const COLLECTION_CUTOFF_CRON = '0 5 * * *';

@Injectable()
export class CollectionCutoffJob implements OnModuleInit {
  constructor(
    private readonly jobs: JobsService,
    private readonly service: CollectionCutoffService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.jobs.schedule(
      COLLECTION_CUTOFF_JOB,
      COLLECTION_CUTOFF_CRON,
      {},
      {
        singletonKey: COLLECTION_CUTOFF_JOB,
      },
    );
    await this.jobs.work(COLLECTION_CUTOFF_JOB, async () => {
      const now = new Date();
      const config = await this.service.getConfig();
      if (this.service.isConfiguredEvaluationDay(now, config.diaCorteMensual)) {
        await this.service.evaluateAndUpdateStatus(now);
      }
    });
  }
}
