import { Module } from '@nestjs/common';
import { ReadingAnomalyController } from './reading-anomaly.controller';
import { ReadingAnomalyService } from './reading-anomaly.service';
import { CreateReadingAnomalyUseCase } from './use-cases/create-reading-anomaly.use-case';
import { FindAllReadingAnomaliesUseCase } from './use-cases/find-all-reading-anomalies.use-case';
import { FindOneReadingAnomalyUseCase } from './use-cases/find-one-reading-anomaly.use-case';
import { UpdateReadingAnomalyUseCase } from './use-cases/update-reading-anomaly.use-case';
import { RemoveReadingAnomalyUseCase } from './use-cases/remove-reading-anomaly.use-case';

@Module({
  controllers: [ReadingAnomalyController],
  providers: [
    ReadingAnomalyService,
    CreateReadingAnomalyUseCase,
    FindAllReadingAnomaliesUseCase,
    FindOneReadingAnomalyUseCase,
    UpdateReadingAnomalyUseCase,
    RemoveReadingAnomalyUseCase,
  ],
  exports: [ReadingAnomalyService],
})
export class ReadingAnomalyModule {}
