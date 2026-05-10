import { Module } from '@nestjs/common';
import { ConveniosController } from './convenios.controller';
import { ConveniosService } from './convenios.service';
import { CreateConvenioUseCase } from './use-cases/create-convenio.use-case';
import { FindOneConvenioUseCase } from './use-cases/find-one-convenio.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';

@Module({
  controllers: [ConveniosController],
  providers: [
    ConveniosService,
    CreateConvenioUseCase,
    FindOneConvenioUseCase,
    GetDebtSummaryUseCase,
  ],
  exports: [ConveniosService, GetDebtSummaryUseCase],
})
export class ConveniosModule {}
