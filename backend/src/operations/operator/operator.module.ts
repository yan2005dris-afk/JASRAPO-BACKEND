import { Module } from '@nestjs/common';
import { OperatorController } from './interfaces/http/operator.controller';
import { OperatorNoveltiesController } from './interfaces/http/operator-novelties.controller';
import { OperatorNoveltiesService } from './application/operator-novelties.service';
import { UpdateOperatorWorkOrderUseCase } from './application/use-cases/update-operator-work-order.use-case';
import { GetOperatorRoutesUseCase } from './application/use-cases/get-operator-routes.use-case';
import { UpdateRouteStateUseCase } from './application/use-cases/update-route-state.use-case';
import { GetOperatorSyncManifestUseCase } from './application/use-cases/get-operator-sync-manifest.use-case';
import { GetOperatorActivityTypesUseCase } from './application/use-cases/get-operator-activity-types.use-case';
import { PrismaOperatorRepository } from './infrastructure/repositories/prisma-operator.repository';
import { OperatorRepository } from './domain/repositories/operator.repository';
import { MeterModule } from 'src/metering/meters/meter.module';
import { ReadingModule } from 'src/metering/readings/reading.module';
import { RepositoriesModule } from 'src/operations/routes/repositories.module';
import { WorkOrderNoveltiesModule } from 'src/operations/work-order-novelties/work-order-novelties.module';

@Module({
  imports: [
    MeterModule,
    ReadingModule,
    WorkOrderNoveltiesModule,
    RepositoriesModule,
  ],
  controllers: [OperatorController, OperatorNoveltiesController],
  providers: [
    UpdateOperatorWorkOrderUseCase,
    GetOperatorRoutesUseCase,
    UpdateRouteStateUseCase,
    GetOperatorSyncManifestUseCase,
    GetOperatorActivityTypesUseCase,
    OperatorNoveltiesService,
    {
      provide: OperatorRepository,
      useClass: PrismaOperatorRepository,
    },
  ],
})
export class OperatorModule {}
