import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { PeriodsController } from './interfaces/http/periods.controller';
import { PeriodsService } from './application/periods.service';
import { PeriodRepository } from './domain/repositories/period.repository';
import { PrismaPeriodRepository } from './infrastructure/repositories/prisma-period.repository';
import { CreatePeriodUseCase } from './application/use-cases/create-period.use-case';
import { FindAllPeriodsUseCase } from './application/use-cases/find-all-periods.use-case';
import { FindOnePeriodUseCase } from './application/use-cases/find-one-period.use-case';
import { UpdatePeriodUseCase } from './application/use-cases/update-period.use-case';
import { DeletePeriodUseCase } from './application/use-cases/delete-period.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [PeriodsController],
  providers: [
    { provide: PeriodRepository, useClass: PrismaPeriodRepository },
    PeriodsService,
    CreatePeriodUseCase,
    FindAllPeriodsUseCase,
    FindOnePeriodUseCase,
    UpdatePeriodUseCase,
    DeletePeriodUseCase,
  ],
  exports: [
    PeriodRepository,
    PeriodsService,
    FindOnePeriodUseCase,
    FindAllPeriodsUseCase,
  ],
})
export class PeriodsModule {}
