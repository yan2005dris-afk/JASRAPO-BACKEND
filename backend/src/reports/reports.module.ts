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

@Module({
  imports: [ClientModule],
  controllers: [ReportsController],
  providers: [
    ClientsListReportSpec,
    PaymentsReportSpec,
    ConnectionHistoryReportSpec,
    AccountStatementReportSpec,
  ],
})
export class ReportsModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(ClientsListPdfDocumentType);
    this.pdfService.registerDocumentType(PaymentsReportPdfDocumentType);
    this.pdfService.registerDocumentType(ConnectionHistoryPdfDocumentType);
    this.pdfService.registerDocumentType(AccountStatementPdfDocumentType);
  }
}
