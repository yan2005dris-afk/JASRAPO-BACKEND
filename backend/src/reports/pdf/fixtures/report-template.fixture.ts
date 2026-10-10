import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { PaymentAgreementPdfDocumentType } from '../factories/payment-agreement.factory';
import { projectAccountStatementReport } from '../../application/definitions/account-statement-report.definition';
import { projectClientsListReport } from '../../application/definitions/clients-list-report.definition';
import { projectConnectionHistoryReport } from '../../application/definitions/connection-history-report.definition';
import { projectPaymentAgreementReport } from '../../application/definitions/payment-agreement-report.definition';
import { projectPaymentsReport } from '../../application/definitions/payments-report.definition';
import type { ReportStyle } from '../../application/report-style.service';
import { createAccountStatementPdfDocumentType } from '../factories/account-statement.factory';
import { createClientsListPdfDocumentType } from '../factories/clients-list.factory';
import { createConnectionHistoryPdfDocumentType } from '../factories/connection-history.factory';
import { createOverdueAccountsPdfDocumentType } from '../factories/overdue-accounts.factory';
import { createPaymentsReportPdfDocumentType } from '../factories/payments-report.factory';
import { createZoneConsumptionPdfDocumentType } from '../factories/zone-consumption.factory';
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

const institutionalFixture = {
  institucion: {
    version: 'v1',
    nombreLegal: 'JUNTA ADMINISTRADORA DE AGUA POTABLE OLON',
    nombreComercial: 'JAAP OLON',
    siglas: 'JASRAPO',
    ruc: '2490012345001',
    decretoNumero: '3327',
    registroOficialNumero: '802',
    registroOficialFechaTexto: '29 de marzo de 1979',
    fechaFundacionTexto: '11 de septiembre de 1982',
    direccion: 'Calle Principal Olón',
    correo: 'juntaaguaolon2017@yahoo.com',
    telefonos: [
      { etiqueta: 'Teléfono', numero: '2788051' },
      { etiqueta: 'Presidencia', numero: '0983717499' },
      { etiqueta: 'Tesorería', numero: '0999896280' },
      { etiqueta: 'Secretaría', numero: '0998945560' },
    ],
    ubicacion: {
      localidad: 'Olón',
      parroquia: 'Colonche',
      canton: 'Santa Elena',
      provincia: 'Santa Elena',
      pais: 'Ecuador',
    },
    representantePrincipal: {
      nombres: 'Sr. Humberto Salinas Neira',
      identificacion: '0915233670',
      cargo: 'Representante JASRAPO',
    },
    branding: {
      logo: { url: 'data:image/jpeg;base64,dGVzdA==' },
      marcaAgua: { url: 'data:image/jpeg;base64,dGVzdA==' },
    },
    textosLegales: {
      convenioPago: {
        introduccionOficina:
          'En las oficinas de la Junta del Sistema Regional de Agua Potable Olón a los',
        compromisoUsuario:
          'se realiza el presente convenio donde se compromete el usuario de la guía',
        identificacionUsuario: 'a nombre del Sr(a)',
        cuotasMensuales: 'comprometiéndose a cancelar en cuotas',
        inicioConvenio:
          'mensuales más el consumo generado por meses consecutivos, convenio que rige a partir del periodo',
        cumplimiento: 'Al dar fiel cumplimiento a lo acordado.',
        pagoEfectivo: 'Las cuotas se cancelan en efectivo a partir de',
        pagosPosteriores:
          'en adelante y así los meses posteriores hasta cancelar la deuda de',
        primeraCuota: 'Comprometiéndose a cancelar la primera cuota de',
        cierre: 'Atentamente',
      },
      actaResponsabilidad: {
        introduccionOficina:
          'En las oficinas de la Junta Administradora del Sistema Regional de Agua Potable Olón',
        compromisoUsuario:
          'en mi calidad de usuario, asumo el compromiso de cumplir con lo establecido en la Institución:',
        clausulas: [],
        cierre:
          'Este compromiso se asume para su cumplimiento dentro de las leyes y reglamentos internos de la Junta y como garantía del uso del agua.',
      },
    },
  },
  metadatosDocumento: {
    perfilInstitucional: { version: 'v1' },
  },
};

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

// Documento determinista (strings fijos, sin fechas por locale) para goldens estables.
const overdueAccountsDocument = {
  data: [
    {
      contratoId: '10',
      numeroGuia: 'G-001',
      clienteNombre: 'Ana Pérez',
      identificacion: '0912345678',
      sectorNombre: 'Sector Norte',
      mesesVencidos: 3,
      saldoPendiente: '77.50',
      saldoPendienteNum: 77.5,
      ultimaEmision: '2024',
      medidorSerie: 'M-001',
    },
    {
      contratoId: '11',
      numeroGuia: 'G-002',
      clienteNombre: 'Comercial Olón',
      identificacion: '0999999999001',
      sectorNombre: 'Sector Sur',
      mesesVencidos: 1,
      saldoPendiente: '22.50',
      saldoPendienteNum: 22.5,
      ultimaEmision: '2024',
      medidorSerie: 'M-002',
    },
  ],
  meta: { total: 2, fechaCorte: '20/5/2024' },
  kpis: { totalMorosidad: '100.00', totalMorosos: 2, mayorDeuda: '77.50' },
  filtros: { descripcion: 'Todos los clientes', fechaCorte: '20/5/2024' },
};

// Documento determinista (strings fijos, sin fechas por locale) para goldens estables.
const zoneConsumptionDocument = {
  data: [
    {
      sectorId: '1',
      sectorNombre: 'Sector Norte',
      comunidadNombre: 'Olón Centro',
      consumoTotal: '320.00',
      consumoTotalNum: 320,
      medidoresConLectura: 3,
      consumoPromedio: '106.67',
      estimadasCount: 1,
      estimadasVolumen: '15.00',
      medidoresSinLectura: 2,
      porcentajeSistema: '64.0',
    },
    {
      sectorId: '2',
      sectorNombre: 'Sector Sur',
      comunidadNombre: 'Olón Centro',
      consumoTotal: '180.00',
      consumoTotalNum: 180,
      medidoresConLectura: 2,
      consumoPromedio: '90.00',
      estimadasCount: 0,
      estimadasVolumen: '0.00',
      medidoresSinLectura: 0,
      porcentajeSistema: '36.0',
    },
  ],
  meta: { total: 2, periodoNombre: 'ENERO 2024' },
  kpis: {
    consumoTotalSistema: '500.00',
    totalZonas: 2,
    zonaMayorConsumo: 'Sector Norte',
    medidoresSinLectura: 2,
  },
  filtros: {
    descripcion: 'Todas las zonas',
    periodoNombre: 'ENERO 2024',
    definicionesVersion: 'defs v0.1 (prototipo)',
  },
};

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
    data: {
      ...documentType.adaptData(input),
      ...institutionalFixture,
    },
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
  createFixture(
    'overdue-accounts',
    'legacy',
    createOverdueAccountsPdfDocumentType('legacy'),
    overdueAccountsDocument,
  ),
  createFixture(
    'overdue-accounts',
    'modern',
    createOverdueAccountsPdfDocumentType('modern'),
    overdueAccountsDocument,
  ),
  createFixture(
    'zone-consumption',
    'legacy',
    createZoneConsumptionPdfDocumentType('legacy'),
    zoneConsumptionDocument,
  ),
  createFixture(
    'zone-consumption',
    'modern',
    createZoneConsumptionPdfDocumentType('modern'),
    zoneConsumptionDocument,
  ),
];
