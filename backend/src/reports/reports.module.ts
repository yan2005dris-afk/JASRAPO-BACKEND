import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from '../infrastructure/pdf/pdf.service';
import { ClientModule } from '../operations/clients/client.module';
import { ReportsController } from './interfaces/http/reports.controller';
import { ClientsListReportSpec } from './specs/clients-list.report-spec';
import { PaymentsReportSpec } from './specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from './specs/connection-history.report-spec';
import { AccountStatementReportSpec } from './specs/account-statement.report-spec';
import { ClientsListPdfDocumentType } from './pdf/clients-list.pdf-type';
import { PaymentsReportPdfDocumentType } from './pdf/payments-report.pdf-type';
import { ConnectionHistoryPdfDocumentType } from './pdf/connection-history.pdf-type';
import { AccountStatementPdfDocumentType } from './pdf/account-statement.pdf-type';
import { PaymentsReportLegacyPdfDocumentType } from './pdf/payments-report-legacy.pdf-type';
import { PaymentsReportModernPdfDocumentType } from './pdf/payments-report-modern.pdf-type';
import { ConnectionHistoryLegacyPdfDocumentType } from './pdf/connection-history-legacy.pdf-type';
import { ConnectionHistoryModernPdfDocumentType } from './pdf/connection-history-modern.pdf-type';
import { createPaymentAgreementPdfDocumentType } from './pdf/factories/payment-agreement.factory';
import { ReportStyleService } from './application/report-style.service';
import { ReportStyleDispatcher } from './application/report-style.dispatcher';
import { AgreementsModule } from '../billing/collections/agreements/agreements.module';

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
  ],
})
export class ReportsModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(ClientsListPdfDocumentType);
    this.pdfService.registerDocumentType(PaymentsReportPdfDocumentType);
    this.pdfService.registerDocumentType(ConnectionHistoryPdfDocumentType);
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
      ConnectionHistoryLegacyPdfDocumentType,
    );
    this.pdfService.registerDocumentType(
      ConnectionHistoryModernPdfDocumentType,
    );
  }
}
