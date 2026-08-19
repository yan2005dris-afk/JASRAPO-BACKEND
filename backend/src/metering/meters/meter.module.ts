import { Module } from '@nestjs/common';
import { MeterService } from './application/meter.service';
import { MeterController } from './interfaces/http/meter.controller';
import { CreateMeterUseCase } from './application/use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './application/use-cases/find-one-meter.use-case';
import { FindAllMetersUseCase } from './application/use-cases/find-all-meters.use-case';
import { UpdateMeterUseCase } from './application/use-cases/update-meter.use-case';
import { RemoveMeterUseCase } from './application/use-cases/remove-meter.use-case';
import { ReplaceMeterUseCase } from './application/use-cases/replace-meter.use-case';
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
    FindAllMetersUseCase,
    UpdateMeterUseCase,
    RemoveMeterUseCase,
    ReplaceMeterUseCase,
  ],
  exports: [
    MeterRepository,
    CreateMeterUseCase,
    FindOneMeterUseCase,
    ReplaceMeterUseCase,
  ],
})
export class MeterModule {}
