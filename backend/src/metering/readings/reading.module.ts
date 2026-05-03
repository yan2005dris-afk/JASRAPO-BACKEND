import { Module } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';
import { ReadingAnomalyModule } from '../reading-anomaly/reading-anomaly.module';

@Module({
  imports: [ReadingAnomalyModule],
  controllers: [ReadingController],
  providers: [
    ReadingService,
    CreateReadingUseCase,
    FindAllReadingsUseCase,
    FindOneReadingUseCase,
    UpdateReadingUseCase,
    RemoveReadingUseCase,
  ],
  exports: [
    CreateReadingUseCase,
    FindAllReadingsUseCase,
    FindOneReadingUseCase,
    UpdateReadingUseCase,
    RemoveReadingUseCase,
  ],
})
export class ReadingModule {}
