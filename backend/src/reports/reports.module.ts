import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { PdfService } from '../infrastructure/pdf/pdf.service';
import { ClientModule } from '../operations/clients/client.module';
import { AgreementsModule } from '../billing/collections/agreements/agreements.module';
import { ReportsController } from './interfaces/http/reports.controller';
import { createConnectionHistoryPdfDocumentType } from './pdf/factories/connection-history.factory';
import { createClientsListPdfDocumentType } from './pdf/factories/clients-list.factory';
import { createAccountStatementPdfDocumentType } from './pdf/factories/account-statement.factory';
import { createPaymentsReportPdfDocumentType } from './pdf/factories/payments-report.factory';
import { PaymentAgreementPdfDocumentType } from '../billing/collections/agreements/pdf/payment-agreement.pdf-type';
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
import { ReportRequestContextFactory } from './application/report-request-context.factory';

@Module({
  imports: [ClientModule, forwardRef(() => AgreementsModule)],
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
    SendReportByEmailUseCase,
    REPORT_EMAIL_STRATEGIES_PROVIDER,
  ],
  exports: [ReportStyleDispatcher, ReportStyleService],
})
export class ReportsModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(
      createClientsListPdfDocumentType('legacy'),
    );
    this.pdfService.registerDocumentType(
      createClientsListPdfDocumentType('modern'),
    );
    this.pdfService.registerDocumentType(
      createAccountStatementPdfDocumentType('legacy'),
    );
    this.pdfService.registerDocumentType(
      createAccountStatementPdfDocumentType('modern'),
    );
    this.pdfService.registerDocumentType(PaymentAgreementPdfDocumentType);
    this.pdfService.registerDocumentType(
      createPaymentsReportPdfDocumentType('legacy'),
    );
    this.pdfService.registerDocumentType(
      createPaymentsReportPdfDocumentType('modern'),
    );
    this.pdfService.registerDocumentType(
      createConnectionHistoryPdfDocumentType('legacy'),
    );
    this.pdfService.registerDocumentType(
      createConnectionHistoryPdfDocumentType('modern'),
    );
  }
}
