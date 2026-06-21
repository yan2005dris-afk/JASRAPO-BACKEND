import { Module } from '@nestjs/common';
import { OperatorController } from './interfaces/http/operator.controller';
import { GetOperatorReadingsUseCase } from './application/use-cases/get-operator-readings.use-case';
import { UpdateOperatorReadingUseCase } from './application/use-cases/update-operator-reading.use-case';
import { SyncAllUseCase } from './application/use-cases/sync-all.use-cate';
import { MeterModule } from '../meters/meter.module';

@Module({
  imports: [MeterModule],
  controllers: [OperatorController],
  providers: [
    GetOperatorReadingsUseCase,
    UpdateOperatorReadingUseCase,
    SyncAllUseCase,
  ],
})
export class OperatorModule {}
