import { Module, forwardRef } from '@nestjs/common';
import { ReadingAnomalyService } from './application/reading-anomaly.service';
import { CreateReadingAnomalyUseCase } from './application/use-cases/create-reading-anomaly.use-case';
import { FindAllReadingAnomaliesUseCase } from './application/use-cases/find-all-reading-anomalies.use-case';
import { FindOneReadingAnomalyUseCase } from './application/use-cases/find-one-reading-anomaly.use-case';
import { UpdateReadingAnomalyUseCase } from './application/use-cases/update-reading-anomaly.use-case';
import { RemoveReadingAnomalyUseCase } from './application/use-cases/remove-reading-anomaly.use-case';
import { ReadingAnomalyRepository } from './domain/repositories/reading-anomaly.repository';
import { PrismaReadingAnomalyRepository } from './infrastructure/repositories/prisma-reading-anomaly.repository';
import { ReadingModule } from '../readings/reading.module';

@Module({
  imports: [forwardRef(() => ReadingModule)],
  controllers: [],
  providers: [
    {
      provide: ReadingAnomalyRepository,
      useClass: PrismaReadingAnomalyRepository,
    },
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
