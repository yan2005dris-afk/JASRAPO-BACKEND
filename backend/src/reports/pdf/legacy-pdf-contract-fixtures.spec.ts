import * as fs from 'node:fs';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import { PaymentAgreementPdfDocumentType } from 'src/billing/collections/agreements/pdf/payment-agreement.pdf-type';
import { projectConnectionHistoryReport } from '../application/definitions/connection-history-report.definition';
import { projectPaymentAgreementReport } from '../application/definitions/payment-agreement-report.definition';
import { projectPaymentsReport } from '../application/definitions/payments-report.definition';
import { createConnectionHistoryPdfDocumentType } from './factories/connection-history.factory';
import { createPaymentsReportPdfDocumentType } from './factories/payments-report.factory';
import {
  LEGACY_CONNECTION_HISTORY_FIXTURE,
  LEGACY_PAYMENT_AGREEMENT_FIXTURE,
  LEGACY_PAYMENTS_REPORT_FIXTURE,
} from './fixtures/legacy-report-contract.fixture';
import { normalizeReportDateRange } from '../application/report-period.normalizer';

const TEMPLATES_DIR = path.resolve(
  __dirname,
  '../../infrastructure/pdf/templates',
);

function renderLegacyFixture(template: string, data: object): string {
  const styles = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'styles.hbs'),
    'utf8',
  );
  Handlebars.registerPartial('styles', styles);
  const source = fs.readFileSync(
    path.join(TEMPLATES_DIR, `${template}.hbs`),
    'utf8',
  );
  return Handlebars.compile(source)(data);
}

describe('legacy PDF contractual fixtures', () => {
  it('legacyReportFixturesPreserveContractValues', () => {
    const connection = projectConnectionHistoryReport(
      LEGACY_CONNECTION_HISTORY_FIXTURE,
    ).document;
    const agreement = projectPaymentAgreementReport(
      LEGACY_PAYMENT_AGREEMENT_FIXTURE,
    ).document;
    const payments = projectPaymentsReport(
      LEGACY_PAYMENTS_REPORT_FIXTURE,
    ).document;
    const range = normalizeReportDateRange(
      LEGACY_PAYMENTS_REPORT_FIXTURE.filters.fechaDesde,
      LEGACY_PAYMENTS_REPORT_FIXTURE.filters.fechaHasta,
      'America/Guayaquil',
    );

    expect(connection.reporte.saldoFinal).toBe('30.00');
    expect(connection.reporte.filas.map(({ emision }) => emision)).toEqual([
      'ENERO 2024',
      'FEBRERO 2024',
    ]);
    expect(agreement.convenio.periodoInicio).toBe('enero de 2020');
    expect(agreement.convenio.primeraCuota).toBe('50.00');
    expect(agreement.convenio.abonoInicial).toBe('10.00');
    expect(payments.reporte.grupos[0].filas[0].emision).toBe('ABRIL 2024');
    expect(range.endExclusive?.toISOString()).toBe('2024-05-21T05:00:00.000Z');
  });

  it('legacyPdfContractFixturesRemainValid', () => {
    const connectionType = createConnectionHistoryPdfDocumentType('legacy');
    const connectionProjection = projectConnectionHistoryReport(
      LEGACY_CONNECTION_HISTORY_FIXTURE,
    );
    const connectionHtml = renderLegacyFixture(
      connectionType.template,
      connectionType.adaptData(connectionProjection.document),
    );

    const agreementProjection = projectPaymentAgreementReport(
      LEGACY_PAYMENT_AGREEMENT_FIXTURE,
    );
    const agreementHtml = renderLegacyFixture(
      PaymentAgreementPdfDocumentType.template,
      PaymentAgreementPdfDocumentType.adaptData(agreementProjection.document),
    );

    const paymentsType = createPaymentsReportPdfDocumentType('legacy');
    const paymentsProjection = projectPaymentsReport(
      LEGACY_PAYMENTS_REPORT_FIXTURE,
    );
    const paymentsHtml = renderLegacyFixture(
      paymentsType.template,
      paymentsType.adaptData(paymentsProjection.document),
    );

    expect(connectionType.template).toBe('connection-history-legacy');
    expect(connectionHtml).toContain('Reporte Historial de Conexión');
    expect(connectionHtml).toContain('30.00');
    expect(PaymentAgreementPdfDocumentType.template).toBe('payment-agreement');
    expect(agreementHtml).toContain('CONVENIO DE PAGO');
    expect(agreementHtml).toContain('enero de 2020');
    expect(agreementHtml).toContain('primera cuota de $50.00');
    expect(paymentsType.template).toBe('payments-report-legacy');
    expect(paymentsHtml).toContain('REPORTE DE ABONOS');
    expect(paymentsHtml).toContain('ABRIL 2024');
  });
});
