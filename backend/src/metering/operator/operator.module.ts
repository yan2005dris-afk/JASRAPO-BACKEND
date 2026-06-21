import { Module } from '@nestjs/common';
import { OperatorController } from './interfaces/http/operator.controller';
import { GetOperatorReadingsUseCase } from './application/use-cases/get-operator-readings.use-case';
import { UpdateOperatorReadingUseCase } from './application/use-cases/update-operator-reading.use-case';
import { SyncAllUseCase } from './application/use-cases/sync-all.use-cate';
import { InstallMeterUseCase } from './application/use-cases/install-meter.use-case';
import { ReportDefectUseCase } from './application/use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from './application/use-cases/decommission-meter.use-case';
import { MeterModule } from '../meters/meter.module';

@Module({
  imports: [MeterModule],
  controllers: [OperatorController],
  providers: [
    GetOperatorReadingsUseCase,
    UpdateOperatorReadingUseCase,
    SyncAllUseCase,
    InstallMeterUseCase,
    ReportDefectUseCase,
    DecommissionMeterUseCase,
  ],
})
export class OperatorModule {}
