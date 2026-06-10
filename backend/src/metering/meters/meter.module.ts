import { Module } from '@nestjs/common';
import { MeterService } from './application/meter.service';
import { MeterController } from './interfaces/http/meter.controller';
import { CreateMeterUseCase } from './application/use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './application/use-cases/find-one-meter.use-case';
import { DecommissionMeterUseCase } from './application/use-cases/decommission-meter.use-case';
import { InstallMeterUseCase } from './application/use-cases/install-meter.use-case';
import { ReportDefectUseCase } from './application/use-cases/report-defect.use-case';
import { MeterRepository } from './domain/repositories/meter.repository';
import { PrismaMeterRepository } from './infrastructure/repositories/prisma-meter.repository';

@Module({
  controllers: [MeterController],
  providers: [
    {
      provide: MeterRepository,
      useClass: PrismaMeterRepository,
    },
    MeterService,
    CreateMeterUseCase,
    FindOneMeterUseCase,
    InstallMeterUseCase,
    ReportDefectUseCase,
    DecommissionMeterUseCase,
  ],
  exports: [
    MeterRepository,
    CreateMeterUseCase,
    FindOneMeterUseCase,
    InstallMeterUseCase,
    ReportDefectUseCase,
    DecommissionMeterUseCase,
  ],
})
export class MeterModule {}
