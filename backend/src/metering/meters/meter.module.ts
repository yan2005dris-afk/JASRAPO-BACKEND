import { Module } from '@nestjs/common';
import { MeterService } from './meter.service';
import { MeterController } from './meter.controller';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { DecommissionMeterUseCase } from './use-cases/decommission-meter.use-case';
import { InstallMeterUseCase } from './use-cases/install-meter.use-case';
import { ReportDefectUseCase } from './use-cases/report-defect.use-case';

@Module({
  controllers: [MeterController],
  providers: [
    MeterService,
    CreateMeterUseCase,
    FindOneMeterUseCase,
    InstallMeterUseCase,
    ReportDefectUseCase,
    DecommissionMeterUseCase,
  ],
  exports: [
    CreateMeterUseCase,
    FindOneMeterUseCase,
    InstallMeterUseCase,
    ReportDefectUseCase,
    DecommissionMeterUseCase,
  ],
})
export class MeterModule {}
