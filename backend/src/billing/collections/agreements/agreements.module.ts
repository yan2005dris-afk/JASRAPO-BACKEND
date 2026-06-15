import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { AgreementsController } from './interfaces/http/agreements.controller';
import { AgreementsService } from './application/agreements.service';
import { CreateAgreementUseCase } from './application/use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './application/use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './application/use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './application/use-cases/update-agreement.use-case';
import { GetPaymentAgreementPdfDataUseCase } from './application/use-cases/get-payment-agreement-pdf-data.use-case';
import { AgreementRepository } from './domain/repositories/agreement.repository';
import { PrismaAgreementRepository } from './infrastructure/repositories/prisma-agreement.repository';
import { PaymentAgreementPdfDocumentType } from './pdf/payment-agreement.pdf-type';

@Module({
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
  exports: [AgreementRepository, AgreementsService, GetDebtSummaryUseCase],
})
export class AgreementsModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(PaymentAgreementPdfDocumentType);
  }
}
