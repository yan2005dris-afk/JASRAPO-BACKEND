import { Module } from '@nestjs/common';
import { StorageModule } from 'src/infrastructure/storage/storage.module';
import { WorkOrderNoveltyController } from './interfaces/http/work-order-novelty.controller';
import { WorkOrderNoveltyService } from './application/services/work-order-novelty.service';
import { WORK_ORDER_NOVELTY_REPOSITORY } from './domain/repositories/work-order-novelty.repository';
import { PrismaWorkOrderNoveltyRepository } from './infrastructure/repositories/prisma-work-order-novelty.repository';

@Module({
  imports: [StorageModule],
  controllers: [WorkOrderNoveltyController],
  providers: [
    WorkOrderNoveltyService,
    {
      provide: WORK_ORDER_NOVELTY_REPOSITORY,
      useClass: PrismaWorkOrderNoveltyRepository,
    },
  ],
  exports: [WorkOrderNoveltyService, WORK_ORDER_NOVELTY_REPOSITORY],
})
export class WorkOrderNoveltiesModule {}
