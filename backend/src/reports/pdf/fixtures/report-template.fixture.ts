import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { PaymentAgreementPdfDocumentType } from 'src/billing/collections/agreements/pdf/payment-agreement.pdf-type';
import { projectAccountStatementReport } from '../../application/definitions/account-statement-report.definition';
import { projectClientsListReport } from '../../application/definitions/clients-list-report.definition';
import { projectConnectionHistoryReport } from '../../application/definitions/connection-history-report.definition';
import { projectPaymentAgreementReport } from '../../application/definitions/payment-agreement-report.definition';
import { projectPaymentsReport } from '../../application/definitions/payments-report.definition';
import type { ReportStyle } from '../../application/report-style.service';
import { createAccountStatementPdfDocumentType } from '../factories/account-statement.factory';
import { createClientsListPdfDocumentType } from '../factories/clients-list.factory';
import { createConnectionHistoryPdfDocumentType } from '../factories/connection-history.factory';
import { createPaymentsReportPdfDocumentType } from '../factories/payments-report.factory';
import {
  LEGACY_CONNECTION_HISTORY_FIXTURE,
  LEGACY_PAYMENT_AGREEMENT_FIXTURE,
  LEGACY_PAYMENTS_REPORT_FIXTURE,
} from './legacy-report-contract.fixture';

export interface ReportTemplateFixture {
  family: string;
  style: ReportStyle;
  type: string;
  template: string;
  data: object;
}

const accountStatementDocument = projectAccountStatementReport({
  contractId: '10',
  contract: {
    guideNumber: 'G-001',
    supplyAddress: 'Barrio Central, Olón',
    sectorName: 'Sector Norte',
    tariffName: 'Residencial',
    minimumMonthlyConsumption: 10,
    baseValue: 4,
    excessValuePerM3: 0.5,
    meterSerial: 'M-001',
    client: {
      nombres: 'Ana',
      apellidos: 'Pérez',
      razonSocial: null,
      identificacion: '0912345678',
      email: 'ana@example.com',
    },
  },
  periods: [
    {
      periodName: '2024',
      annualPayment: 24,
      readings: [
        {
          date: new Date('2024-01-15T12:00:00.000Z'),
          currentReading: 115,
          previousReading: 100,
          consumption: 15,
        },
        {
          date: new Date('2024-02-15T12:00:00.000Z'),
          currentReading: 123,
          previousReading: 115,
          consumption: 8,
        },
      ],
    },
  ],
  generatedAt: new Date('2024-05-20T12:00:00.000Z'),
}).document;

const clientsListDocument = projectClientsListReport({
  clients: [
    {
      identificacion: '0912345678',
      nombres: 'Ana',
      apellidos: 'Pérez',
      razonSocial: null,
      email: 'ana@example.com',
      telefono: '0999999999',
      direccionDomicilio: 'Olón',
      activo: true,
      tipoIdentificacion: { descripcion: 'CÉDULA' },
    },
    {
      identificacion: '0999999999001',
      nombres: '',
      apellidos: '',
      razonSocial: 'Comercial Olón',
      email: null,
      telefono: null,
      direccionDomicilio: null,
      activo: false,
      tipoIdentificacion: { descripcion: 'RUC' },
    },
  ],
  filters: { activo: true },
  generatedAt: new Date('2024-05-20T12:00:00.000Z'),
}).document;

const connectionHistoryDocument = projectConnectionHistoryReport(
  LEGACY_CONNECTION_HISTORY_FIXTURE,
).document;
const paymentsReportDocument = projectPaymentsReport(
  LEGACY_PAYMENTS_REPORT_FIXTURE,
).document;
const paymentAgreementDocument = projectPaymentAgreementReport(
  LEGACY_PAYMENT_AGREEMENT_FIXTURE,
).document;

function createFixture<TInput, TOutput extends object>(
  family: string,
  style: ReportStyle,
  documentType: PdfDocumentType<TInput, TOutput>,
  input: TInput,
): ReportTemplateFixture {
  return {
    family,
    style,
    type: documentType.type,
    template: documentType.template,
    data: documentType.adaptData(input),
  };
}

export const REPORT_TEMPLATE_FIXTURES: readonly ReportTemplateFixture[] = [
  createFixture(
    'account-statement',
    'legacy',
    createAccountStatementPdfDocumentType('legacy'),
    accountStatementDocument,
  ),
  createFixture(
    'account-statement',
    'modern',
    createAccountStatementPdfDocumentType('modern'),
    accountStatementDocument,
  ),
  createFixture(
    'clients-list',
    'legacy',
    createClientsListPdfDocumentType('legacy'),
    clientsListDocument,
  ),
  createFixture(
    'clients-list',
    'modern',
    createClientsListPdfDocumentType('modern'),
    clientsListDocument,
  ),
  createFixture(
    'connection-history',
    'legacy',
    createConnectionHistoryPdfDocumentType('legacy'),
    connectionHistoryDocument,
  ),
  createFixture(
    'connection-history',
    'modern',
    createConnectionHistoryPdfDocumentType('modern'),
    connectionHistoryDocument,
  ),
  createFixture(
    'payments-report',
    'legacy',
    createPaymentsReportPdfDocumentType('legacy'),
    paymentsReportDocument,
  ),
  createFixture(
    'payments-report',
    'modern',
    createPaymentsReportPdfDocumentType('modern'),
    paymentsReportDocument,
  ),
  createFixture(
    'payment-agreement',
    'unique',
    PaymentAgreementPdfDocumentType,
    paymentAgreementDocument,
  ),
];
