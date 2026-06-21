import { Module } from '@nestjs/common';
import { MeterService } from './application/meter.service';
import { MeterController } from './interfaces/http/meter.controller';
import { CreateMeterUseCase } from './application/use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './application/use-cases/find-one-meter.use-case';
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
  ],
  exports: [
    MeterRepository,
    CreateMeterUseCase,
    FindOneMeterUseCase,
  ],
})
export class MeterModule {}
