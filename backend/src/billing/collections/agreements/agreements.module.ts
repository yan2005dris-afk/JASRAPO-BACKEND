import { Module } from '@nestjs/common';
import { AgreementsController } from './interfaces/http/agreements.controller';
import { AgreementsService } from './application/services/agreements.service';
import { CreateAgreementUseCase } from './application/use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './application/use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './application/use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './application/use-cases/update-agreement.use-case';
import { AgreementRepository } from './domain/repositories/agreement.repository';
import { PrismaAgreementRepository } from './infrastructure/repositories/prisma-agreement.repository';

@Module({
  controllers: [AgreementsController],
  providers: [
    { provide: AgreementRepository, useClass: PrismaAgreementRepository },
    AgreementsService,
    CreateAgreementUseCase,
    FindOneAgreementUseCase,
    GetDebtSummaryUseCase,
    UpdateAgreementUseCase,
  ],
  exports: [
    AgreementRepository,
    AgreementsService,
    GetDebtSummaryUseCase,
  ],
})
export class AgreementsModule {}
