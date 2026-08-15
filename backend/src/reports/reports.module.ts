import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from '../infrastructure/pdf/pdf.service';
import { ClientModule } from '../operations/clients/client.module';
import { AgreementsModule } from '../billing/collections/agreements/agreements.module';
import { ReportsController } from './interfaces/http/reports.controller';
import { ClientsListReportSpec } from './infrastructure/specs/clients-list.report-spec';
import { PaymentsReportSpec } from './infrastructure/specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from './infrastructure/specs/connection-history.report-spec';
import { AccountStatementReportSpec } from './infrastructure/specs/account-statement.report-spec';
import { ClientsListPdfDocumentType } from './pdf/clients-list.pdf-type';
import { AccountStatementPdfDocumentType } from './pdf/account-statement.pdf-type';
import { PaymentsReportLegacyPdfDocumentType } from './pdf/payments-report-legacy.pdf-type';
import { PaymentsReportModernPdfDocumentType } from './pdf/payments-report-modern.pdf-type';
import { createPaymentAgreementPdfDocumentType } from './pdf/factories/payment-agreement.factory';
import { createConnectionHistoryPdfDocumentType } from './pdf/factories/connection-history.factory';
import { ReportStyleService } from './application/report-style.service';
import { ReportStyleDispatcher } from './application/report-style.dispatcher';
import { SendReportByEmailUseCase } from './application/use-cases/send-report-by-email.use-case';
import {
  AccountStatementReportEmailStrategy,
  ClientsListReportEmailStrategy,
  ConnectionHistoryReportEmailStrategy,
  PaymentAgreementReportEmailStrategy,
  PaymentsReportEmailStrategy,
  REPORT_EMAIL_STRATEGIES_PROVIDER,
} from './application/use-cases/send-report-by-email.strategies';

@Module({
  imports: [ClientModule, AgreementsModule],
  controllers: [ReportsController],
  providers: [
    ClientsListReportSpec,
    PaymentsReportSpec,
    ConnectionHistoryReportSpec,
    AccountStatementReportSpec,
    ReportStyleService,
    ReportStyleDispatcher,
    PaymentsReportEmailStrategy,
    ConnectionHistoryReportEmailStrategy,
    PaymentAgreementReportEmailStrategy,
    AccountStatementReportEmailStrategy,
    ClientsListReportEmailStrategy,
    SendReportByEmailUseCase,
    REPORT_EMAIL_STRATEGIES_PROVIDER,
  ],
})
export class ReportsModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(ClientsListPdfDocumentType);
    this.pdfService.registerDocumentType(AccountStatementPdfDocumentType);
    this.pdfService.registerDocumentType(
      createPaymentAgreementPdfDocumentType('legacy'),
    );
    this.pdfService.registerDocumentType(
      createPaymentAgreementPdfDocumentType('modern'),
    );
    this.pdfService.registerDocumentType(PaymentsReportLegacyPdfDocumentType);
    this.pdfService.registerDocumentType(PaymentsReportModernPdfDocumentType);
    this.pdfService.registerDocumentType(
      createConnectionHistoryPdfDocumentType('legacy'),
    );
    this.pdfService.registerDocumentType(
      createConnectionHistoryPdfDocumentType('modern'),
    );
  }
}
