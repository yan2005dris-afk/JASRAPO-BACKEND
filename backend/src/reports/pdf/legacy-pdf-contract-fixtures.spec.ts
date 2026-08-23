import * as fs from 'node:fs';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import { createConnectionHistoryPdfDocumentType } from './factories/connection-history.factory';
import { createPaymentAgreementPdfDocumentType } from './factories/payment-agreement.factory';
import { PaymentsReportLegacyPdfDocumentType } from './payments-report-legacy.pdf-type';

const TEMPLATES_DIR = path.resolve(
  __dirname,
  '../../infrastructure/pdf/templates',
);

function renderLegacyFixture(
  template: string,
  data: Record<string, unknown>,
): string {
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
  it('legacyPdfContractFixturesRemainValid', () => {
    const connectionHistory = createConnectionHistoryPdfDocumentType('legacy');
    const connectionHtml = renderLegacyFixture(
      connectionHistory.template,
      connectionHistory.adaptData({
        contratoId: '10',
        prefacturas: [
          {
            periodoRel: { nombre: 'ENERO 2024' },
            totalPagar: 50,
            abono: 30,
            saldoActual: 20,
            contrato: {
              cliente: { nombres: 'Ana', apellidos: 'Pérez' },
              historialMedidores: [{ medidor: { serie: 'M-001' } }],
            },
          },
          {
            periodoRel: { nombre: 'FEBRERO 2024' },
            totalPagar: 10,
            abono: 0,
            saldoActual: 10,
            contrato: {
              cliente: { nombres: 'Ana', apellidos: 'Pérez' },
              historialMedidores: [{ medidor: { serie: 'M-001' } }],
            },
          },
        ],
      }),
    );

    const paymentAgreement = createPaymentAgreementPdfDocumentType('legacy');
    const agreementHtml = renderLegacyFixture(
      paymentAgreement.template,
      paymentAgreement.adaptData({
        convenio: {
          createdAt: '2024-05-10T10:00:00.000Z',
          periodoInicio: '2020-01-01T00:00:00.000Z',
          fechaPrimerPago: '2024-06-01T00:00:00.000Z',
          cuotaMensual: 50,
          primeraCuota: 50,
          deudaTotal: 200,
          abonoInicial: 10,
          numeroCuotas: 4,
          cliente: {
            nombres: 'Ana',
            apellidos: 'Pérez',
            identificacion: '0912345678',
          },
          contrato: { numeroGuia: 'G-001' },
        },
      }),
    );

    const paymentsHtml = renderLegacyFixture(
      PaymentsReportLegacyPdfDocumentType.template,
      PaymentsReportLegacyPdfDocumentType.adaptData({
        pagos: [
          {
            factura: 'F-001',
            fecha: '20/05/2024',
            clienteNombre: 'Ana Pérez',
            cuenta: '10',
            medidor: 'M-001',
            emision: 'ABRIL 2024',
            valor: '25.00',
            valorNum: 25,
          },
        ],
      }),
    );

    expect(connectionHistory.template).toBe('connection-history-legacy');
    expect(connectionHtml).toContain('Reporte Historial de Conexión');
    expect(connectionHtml).toContain('30.00');

    expect(paymentAgreement.template).toBe('payment-agreement-legacy');
    expect(agreementHtml).toContain('CONVENIO DE PAGO');
    expect(agreementHtml).toContain('enero de 2020');
    expect(agreementHtml).toContain('primera cuota de $50.00');

    expect(PaymentsReportLegacyPdfDocumentType.template).toBe(
      'payments-report-legacy',
    );
    expect(paymentsHtml).toContain('REPORTE DE ABONOS');
    expect(paymentsHtml).toContain('ABRIL 2024');
  });
});
