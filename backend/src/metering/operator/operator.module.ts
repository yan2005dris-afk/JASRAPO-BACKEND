import { Module } from '@nestjs/common';
import { OperatorController } from './interfaces/http/operator.controller';
import { GetOperatorReadingsUseCase } from './application/use-cases/get-operator-readings.use-case';
import { UpdateOperatorReadingUseCase } from './application/use-cases/update-operator-reading.use-case';
import { SyncAllUseCase } from './application/use-cases/sync-all.use-case';
import { GetOperatorTasksUseCase } from './application/use-cases/get-operator-tasks.use-case';
import { UpdateTaskStateUseCase } from './application/use-cases/update-task-state.use-case';
import { InstallMeterUseCase } from './application/use-cases/install-meter.use-case';
import { ReportDefectUseCase } from './application/use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from './application/use-cases/decommission-meter.use-case';
import { GetOperatorReadingsWithAnomaliesUseCase } from './application/use-cases/get-operator-readings-with-anomalies.use-case';
import { PrismaOperatorRepository } from './infrastructure/repositories/prisma-operator.repository';
import { OperatorRepository } from './domain/repositories/operator.repository';
import { MeterModule } from '../meters/meter.module';
import { ReadingModule } from '../readings/reading.module';

@Module({
  imports: [MeterModule, ReadingModule],
  controllers: [OperatorController],
  providers: [
    GetOperatorReadingsUseCase,
    UpdateOperatorReadingUseCase,
    SyncAllUseCase,
    GetOperatorTasksUseCase,
    UpdateTaskStateUseCase,
    InstallMeterUseCase,
    ReportDefectUseCase,
    DecommissionMeterUseCase,
    GetOperatorReadingsWithAnomaliesUseCase,
    {
      provide: OperatorRepository,
      useClass: PrismaOperatorRepository,
    },
  ],
})
export class OperatorModule {}
