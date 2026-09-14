import { Module } from '@nestjs/common';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { JobsModule } from 'src/infrastructure/jobs/jobs.module';
import { WorkOrderNoveltyController } from './interfaces/http/work-order-novelty.controller';
import { WorkOrderNoveltyService } from './application/services/work-order-novelty.service';
import { WORK_ORDER_NOVELTY_REPOSITORY } from './domain/repositories/work-order-novelty.repository';
import { PrismaWorkOrderNoveltyRepository } from './infrastructure/repositories/prisma-work-order-novelty.repository';
import { NoveltyEvidenceQueueService } from './infrastructure/novelty-evidence-queue.service';

@Module({
  imports: [StorageModule, JobsModule],
  controllers: [WorkOrderNoveltyController],
  providers: [
    WorkOrderNoveltyService,
    {
      provide: WORK_ORDER_NOVELTY_REPOSITORY,
      useClass: PrismaWorkOrderNoveltyRepository,
    },
    NoveltyEvidenceQueueService,
  ],
  exports: [WorkOrderNoveltyService, WORK_ORDER_NOVELTY_REPOSITORY],
})
export class WorkOrderNoveltiesModule {}
