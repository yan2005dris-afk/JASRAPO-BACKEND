import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from '../infrastructure/pdf/pdf.service';
import { ClientModule } from '../operations/clients/client.module';
import { AgreementsModule } from '../billing/collections/agreements/agreements.module';
import { ReportsController } from './interfaces/http/reports.controller';
import { REPORT_PDF_DOCUMENT_TYPES } from './pdf/report-pdf-document-types';
import { ReportStyleService } from './application/report-style.service';
import { ReportStyleDispatcher } from './application/report-style.dispatcher';
import { SendReportByEmailUseCase } from './application/use-cases/send-report-by-email.use-case';
import {
  AccountStatementReportEmailStrategy,
  ClientsListReportEmailStrategy,
  ConnectionHistoryReportEmailStrategy,
  OverdueAccountsReportEmailStrategy,
  PaymentAgreementReportEmailStrategy,
  PaymentsReportEmailStrategy,
  REPORT_EMAIL_STRATEGIES_PROVIDER,
} from './application/use-cases/send-report-by-email.strategies';

import { ClientsListReportDefinition } from './application/definitions/clients-list-report.definition';
import { PaymentsReportDefinition } from './application/definitions/payments-report.definition';
import { ConnectionHistoryReportDefinition } from './application/definitions/connection-history-report.definition';
import { AccountStatementReportDefinition } from './application/definitions/account-statement-report.definition';
import { OverdueAccountsReportDefinition } from './application/definitions/overdue-accounts-report.definition';
import { PaymentAgreementReportDefinition } from './application/definitions/payment-agreement-report.definition';
import {
  AccountStatementReportQueryPort,
  ClientsListReportQueryPort,
  ConnectionHistoryReportQueryPort,
  OverdueAccountsReportQueryPort,
  PaymentAgreementReportQueryPort,
  PaymentsReportQueryPort,
} from './application/ports/report-query.ports';
import { ClientServiceClientsListReportQueryAdapter } from './infrastructure/queries/client-service-clients-list-report-query.adapter';
import { PrismaPaymentsReportQueryAdapter } from './infrastructure/queries/prisma-payments-report-query.adapter';
import { PrismaConnectionHistoryReportQueryAdapter } from './infrastructure/queries/prisma-connection-history-report-query.adapter';
import { PrismaAccountStatementReportQueryAdapter } from './infrastructure/queries/prisma-account-statement-report-query.adapter';
import { PrismaOverdueAccountsReportQueryAdapter } from './infrastructure/queries/prisma-overdue-accounts-report-query.adapter';
import { AgreementPaymentAgreementReportQueryAdapter } from './infrastructure/queries/agreement-payment-agreement-report-query.adapter';
import { ReportEmailQueue } from './application/report-email-queue.port';
import { ReportEmailJobService } from './infrastructure/report-email-job.service';
import { ReportRequestContextFactory } from './application/report-request-context.factory';
import { InstitutionalProfileModule } from '../institutional-profile/institutional-profile.module';
import { ExportModule } from '../infrastructure/export/export.module';

@Module({
  imports: [
    ClientModule,
    AgreementsModule,
    InstitutionalProfileModule,
    ExportModule,
  ],
  controllers: [ReportsController],
  providers: [
    ClientsListReportDefinition,
    PaymentsReportDefinition,
    ConnectionHistoryReportDefinition,
    AccountStatementReportDefinition,
    OverdueAccountsReportDefinition,
    PaymentAgreementReportDefinition,
    ReportRequestContextFactory,
    {
      provide: ClientsListReportQueryPort,
      useClass: ClientServiceClientsListReportQueryAdapter,
    },
    {
      provide: PaymentsReportQueryPort,
      useClass: PrismaPaymentsReportQueryAdapter,
    },
    {
      provide: ConnectionHistoryReportQueryPort,
      useClass: PrismaConnectionHistoryReportQueryAdapter,
    },
    {
      provide: AccountStatementReportQueryPort,
      useClass: PrismaAccountStatementReportQueryAdapter,
    },
    {
      provide: OverdueAccountsReportQueryPort,
      useClass: PrismaOverdueAccountsReportQueryAdapter,
    },
    {
      provide: PaymentAgreementReportQueryPort,
      useClass: AgreementPaymentAgreementReportQueryAdapter,
    },
    ReportStyleService,
    ReportStyleDispatcher,
    PaymentsReportEmailStrategy,
    ConnectionHistoryReportEmailStrategy,
    PaymentAgreementReportEmailStrategy,
    AccountStatementReportEmailStrategy,
    ClientsListReportEmailStrategy,
    OverdueAccountsReportEmailStrategy,
    REPORT_EMAIL_STRATEGIES_PROVIDER,
    ReportEmailJobService,
    { provide: ReportEmailQueue, useExisting: ReportEmailJobService },
    SendReportByEmailUseCase,
  ],
  exports: [ReportStyleDispatcher, ReportStyleService],
})
export class ReportsModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    for (const documentType of REPORT_PDF_DOCUMENT_TYPES) {
      this.pdfService.registerDocumentType(documentType);
    }
  }
}
