import { Module, forwardRef } from '@nestjs/common';
import { ReportsModule } from 'src/reports/reports.module';
import { AgreementsController } from './interfaces/http/agreements.controller';
import { AgreementsService } from './application/agreements.service';
import { CreateAgreementUseCase } from './application/use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './application/use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './application/use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './application/use-cases/update-agreement.use-case';
import { GetPaymentAgreementPdfDataUseCase } from './application/use-cases/get-payment-agreement-pdf-data.use-case';
import { AgreementRepository } from './domain/repositories/agreement.repository';
import { PrismaAgreementRepository } from './infrastructure/repositories/prisma-agreement.repository';

@Module({
  imports: [forwardRef(() => ReportsModule)],
  controllers: [AgreementsController],
  providers: [
    { provide: AgreementRepository, useClass: PrismaAgreementRepository },
    AgreementsService,
    CreateAgreementUseCase,
    FindOneAgreementUseCase,
    GetDebtSummaryUseCase,
    UpdateAgreementUseCase,
    GetPaymentAgreementPdfDataUseCase,
  ],
  exports: [
    AgreementRepository,
    AgreementsService,
    GetDebtSummaryUseCase,
    GetPaymentAgreementPdfDataUseCase,
  ],
})
export class AgreementsModule {}
