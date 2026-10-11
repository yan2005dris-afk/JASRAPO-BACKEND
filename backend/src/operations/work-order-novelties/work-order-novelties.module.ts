import { Module } from '@nestjs/common';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { JobsModule } from 'src/infrastructure/jobs/jobs.module';
import { WorkOrderNoveltyController } from './interfaces/http/work-order-novelty.controller';
import { WorkOrderNoveltyService } from './application/work-order-novelty.service';
import { CreateWorkOrderNoveltyUseCase } from './application/use-cases/create-work-order-novelty.use-case';
import { FindWorkOrderNoveltyUseCase } from './application/use-cases/find-work-order-novelty.use-case';
import { FindWorkOrderNoveltiesUseCase } from './application/use-cases/find-work-order-novelties.use-case';
import { UpdateWorkOrderNoveltyUseCase } from './application/use-cases/update-work-order-novelty.use-case';
import { SoftDeleteWorkOrderNoveltyUseCase } from './application/use-cases/soft-delete-work-order-novelty.use-case';
import { WORK_ORDER_NOVELTY_REPOSITORY } from './domain/repositories/work-order-novelty.repository';
import { PrismaWorkOrderNoveltyRepository } from './infrastructure/repositories/prisma-work-order-novelty.repository';
import { NoveltyEvidenceQueueService } from './infrastructure/novelty-evidence-queue.service';

import { RepositoriesModule } from '../routes/repositories.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';

@Module({
  imports: [StorageModule, JobsModule, RepositoriesModule, WorkOrdersModule],
  controllers: [WorkOrderNoveltyController],
  providers: [
    WorkOrderNoveltyService,
    CreateWorkOrderNoveltyUseCase,
    FindWorkOrderNoveltyUseCase,
    FindWorkOrderNoveltiesUseCase,
    UpdateWorkOrderNoveltyUseCase,
    SoftDeleteWorkOrderNoveltyUseCase,
    {
      provide: WORK_ORDER_NOVELTY_REPOSITORY,
      useClass: PrismaWorkOrderNoveltyRepository,
    },
    NoveltyEvidenceQueueService,
  ],
  exports: [WorkOrderNoveltyService, WORK_ORDER_NOVELTY_REPOSITORY],
})
export class WorkOrderNoveltiesModule {}
