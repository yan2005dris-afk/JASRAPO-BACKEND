import { Module } from '@nestjs/common';
import { OperatorController } from './interfaces/http/operator.controller';
import { GetOperatorReadingsUseCase } from './application/use-cases/get-operator-readings.use-case';
import { UpdateOperatorReadingUseCase } from './application/use-cases/update-operator-reading.use-case';
import { SyncAllUseCase } from './application/use-cases/sync-all.use-cate';
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
    {
      provide: OperatorRepository,
      useClass: PrismaOperatorRepository,
    },
  ],
})
export class OperatorModule {}
