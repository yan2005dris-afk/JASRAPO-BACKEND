import * as fs from 'node:fs';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import { PaymentAgreementPdfDocumentType } from 'src/billing/collections/agreements/pdf/payment-agreement.pdf-type';
import { projectConnectionHistoryReport } from '../application/definitions/connection-history-report.definition';
import { projectPaymentAgreementReport } from '../application/definitions/payment-agreement-report.definition';
import { projectPaymentsReport } from '../application/definitions/payments-report.definition';
import { createConnectionHistoryPdfDocumentType } from './factories/connection-history.factory';
import { createPaymentsReportPdfDocumentType } from './factories/payments-report.factory';

const TEMPLATES_DIR = path.resolve(
  __dirname,
  '../../infrastructure/pdf/templates',
);

const institutionalFixture = {
  institucion: {
    nombreLegal: 'Institución de prueba',
    nombreComercial: 'Marca de prueba',
    siglas: 'TEST',
    ruc: '9999999999999',
    decretoNumero: null,
    registroOficialNumero: null,
    registroOficialFechaTexto: null,
    fechaFundacionTexto: null,
    direccion: 'Dirección de prueba',
    correo: 'test@example.com',
    telefonos: [],
    ubicacion: {
      localidad: 'Localidad',
      provincia: 'Provincia',
      pais: 'Ecuador',
    },
    representantePrincipal: {
      nombres: 'Representante',
      identificacion: '0000000000',
      cargo: 'Representante',
    },
    branding: {
      logo: { url: 'data:image/png;base64,dGVzdA==' },
      marcaAgua: { url: 'data:image/png;base64,dGVzdA==' },
    },
    textosLegales: {
      convenioPago: {
        introduccionOficina: 'En las oficinas a los',
        compromisoUsuario: 'se acuerda con la guía',
        identificacionUsuario: 'a nombre de',
        cuotasMensuales: 'cancelar en cuotas de',
        inicioConvenio: 'desde el periodo',
        cumplimiento: 'Conforme a lo acordado.',
        pagoEfectivo: 'Las cuotas se pagan desde',
        pagosPosteriores: 'hasta cancelar la deuda de',
        primeraCuota: 'Comprometiéndose a cancelar la primera cuota de',
        cierre: 'Atentamente',
      },
    },
  },
  metadatosDocumento: {
    perfilInstitucional: { version: 'test-v1' },
  },
};

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
  it('legacyPdfContractFixturesRemainValid', () => {
    const connectionType = createConnectionHistoryPdfDocumentType('legacy');
    const connectionProjection = projectConnectionHistoryReport({
      contractId: '10',
      client: { nombres: 'Ana', apellidos: 'Pérez', razonSocial: null },
      meterSerial: 'M-001',
      invoices: [
        {
          periodName: 'ENERO 2024',
          currentReading: 10,
          previousReading: 5,
          consumption: 5,
          billedAmount: 50,
          paidAmount: 30,
          outstandingBalance: 20,
        },
        {
          periodName: 'FEBRERO 2024',
          currentReading: 15,
          previousReading: 10,
          consumption: 5,
          billedAmount: 10,
          paidAmount: 0,
          outstandingBalance: 10,
        },
      ],
      filters: { contratoId: '10' },
      recipientEmail: 'ana@example.com',
      generatedAt: new Date('2024-05-20T00:00:00.000Z'),
    });
    const connectionHtml = renderLegacyFixture(
      connectionType.template,
      connectionType.adaptData(connectionProjection.document),
    );

    const agreementProjection = projectPaymentAgreementReport({
      convenio: {
        convenioId: '1',
        contratoId: '10',
        createdAt: '2024-05-10T10:00:00.000Z',
        periodoInicio: '2020-01-01T00:00:00.000Z',
        fechaPrimerPago: '2024-06-01T00:00:00.000Z',
        cuotaMensual: 50,
        primeraCuota: 50,
        deudaTotal: 200,
        abonoInicial: 10,
        numeroCuotas: 4,
        motivo: null,
        cliente: {
          nombres: 'Ana',
          apellidos: 'Pérez',
          razonSocial: null,
          identificacion: '0912345678',
          email: 'ana@example.com',
        },
        contrato: { numeroGuia: 'G-001', direccionSuministro: 'Olón' },
      },
    });
    const agreementHtml = renderLegacyFixture(
      PaymentAgreementPdfDocumentType.template,
      PaymentAgreementPdfDocumentType.adaptData({
        ...agreementProjection.document,
        ...institutionalFixture,
      }),
    );

    const paymentsType = createPaymentsReportPdfDocumentType('legacy');
    const paymentsProjection = projectPaymentsReport({
      payments: [
        {
          paymentDate: new Date('2024-05-20T15:00:00.000Z'),
          client: { nombres: 'Ana', apellidos: 'Pérez', razonSocial: null },
          details: [
            {
              invoiceNumber: 'F-001',
              billedPeriodName: 'ABRIL 2024',
              contractId: '10',
              meterSerial: 'M-001',
              amount: 25,
            },
          ],
        },
      ],
      filters: {},
      recipientEmail: null,
      generatedAt: new Date('2024-05-20T00:00:00.000Z'),
    });
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
