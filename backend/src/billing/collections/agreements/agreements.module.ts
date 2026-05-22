import { Module } from '@nestjs/common';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';
import { CreateAgreementUseCase } from './use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';

@Module({
  controllers: [AgreementsController],
  providers: [
    AgreementsService,
    CreateAgreementUseCase,
    FindOneAgreementUseCase,
    GetDebtSummaryUseCase,
  ],
  exports: [AgreementsService, GetDebtSummaryUseCase],
})
export class AgreementsModule {}
