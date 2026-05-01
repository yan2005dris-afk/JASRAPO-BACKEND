import { Module } from '@nestjs/common';
import { LecturaService } from './lectura.service';
import { LecturaController } from './lectura.controller';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';

@Module({
  controllers: [LecturaController],
  providers: [
    LecturaService,
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
export class LecturaModule {}
