import { Module } from '@nestjs/common';
import { ReadingService } from './application/services/reading.service';
import { ReadingController } from './interfaces/http/reading.controller';
import { CreateReadingUseCase } from './application/use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './application/use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './application/use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './application/use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './application/use-cases/remove-reading.use-case';
import { ReadingAnomalyModule } from '../reading-anomaly/reading-anomaly.module';
import { ReadingRepository } from './domain/repositories/reading.repository';
import { PrismaReadingRepository } from './infrastructure/repositories/prisma-reading.repository';

@Module({
  imports: [ReadingAnomalyModule],
  controllers: [ReadingController],
  providers: [
    {
      provide: ReadingRepository,
      useClass: PrismaReadingRepository,
    },
    ReadingService,
    CreateReadingUseCase,
    FindAllReadingsUseCase,
    FindOneReadingUseCase,
    UpdateReadingUseCase,
    RemoveReadingUseCase,
  ],
  exports: [
    ReadingRepository,
    CreateReadingUseCase,
    FindAllReadingsUseCase,
    FindOneReadingUseCase,
    UpdateReadingUseCase,
    RemoveReadingUseCase,
  ],
})
export class ReadingModule {}
