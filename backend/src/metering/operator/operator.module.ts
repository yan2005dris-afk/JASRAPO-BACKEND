import { Module } from '@nestjs/common';
import { OperatorController } from './interfaces/http/operator.controller';
import { OperatorNoveltiesController } from './interfaces/http/operator-novelties.controller';
import { OperatorNoveltiesService } from './application/operator-novelties.service';
import { GetOperatorReadingsUseCase } from './application/use-cases/get-operator-readings.use-case';
import { UpdateOperatorReadingUseCase } from './application/use-cases/update-operator-reading.use-case';
import { UpdateOperatorWorkOrderUseCase } from './application/use-cases/update-operator-work-order.use-case';
import { GetOperatorRoutesUseCase } from './application/use-cases/get-operator-routes.use-case';
import { UpdateRouteStateUseCase } from './application/use-cases/update-route-state.use-case';
import { ReportDefectUseCase } from './application/use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from './application/use-cases/decommission-meter.use-case';
import { GetOperatorReadingsWithAnomaliesUseCase } from './application/use-cases/get-operator-readings-with-anomalies.use-case';
import { GetOperatorSyncManifestUseCase } from './application/use-cases/get-operator-sync-manifest.use-case';
import { GetOperatorActivityTypesUseCase } from './application/use-cases/get-operator-activity-types.use-case';
import { PrismaOperatorRepository } from './infrastructure/repositories/prisma-operator.repository';
import { OperatorRepository } from './domain/repositories/operator.repository';
import { MeterModule } from '../meters/meter.module';
import { ReadingModule } from '../readings/reading.module';
import { PrismaOrdenTrabajoRepository } from 'src/operations/routes/infrastructure/repositories/prisma-orden-trabajo.repository';
import { OrdenTrabajoRepository } from 'src/operations/routes/domain/repositories/orden-trabajo.repository';
import { WorkOrderNoveltiesModule } from 'src/operations/work-order-novelties/work-order-novelties.module';

@Module({
  imports: [MeterModule, ReadingModule, WorkOrderNoveltiesModule],
  controllers: [OperatorController, OperatorNoveltiesController],
  providers: [
    GetOperatorReadingsUseCase,
    UpdateOperatorReadingUseCase,
    UpdateOperatorWorkOrderUseCase,
    GetOperatorRoutesUseCase,
    UpdateRouteStateUseCase,
    ReportDefectUseCase,
    DecommissionMeterUseCase,
    GetOperatorReadingsWithAnomaliesUseCase,
    GetOperatorSyncManifestUseCase,
    GetOperatorActivityTypesUseCase,
    OperatorNoveltiesService,
    {
      provide: OperatorRepository,
      useClass: PrismaOperatorRepository,
    },
    {
      provide: OrdenTrabajoRepository,
      useClass: PrismaOrdenTrabajoRepository,
    },
  ],
})
export class OperatorModule {}
