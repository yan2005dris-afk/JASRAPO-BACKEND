import type { ConnectionHistoryReportReadModel } from '../../application/read-models/connection-history.read-model';
import type { PaymentAgreementReportReadModel } from '../../application/read-models/payment-agreement.read-model';
import type { PaymentsReportReadModel } from '../../application/read-models/payments-report.read-model';

export const LEGACY_CONNECTION_HISTORY_FIXTURE = {
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
  filters: {
    contratoId: '10',
    fechaDesde: '2024-01-01',
    fechaHasta: '2024-02-29',
  },
  recipientEmail: 'ana@example.com',
  generatedAt: new Date('2024-05-20T12:00:00.000Z'),
} satisfies ConnectionHistoryReportReadModel;

export const LEGACY_PAYMENT_AGREEMENT_FIXTURE = {
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
} satisfies PaymentAgreementReportReadModel;

export const LEGACY_PAYMENTS_REPORT_FIXTURE = {
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
  filters: {
    fechaDesde: '2024-05-01',
    fechaHasta: '2024-05-20',
  },
  recipientEmail: null,
  generatedAt: new Date('2024-05-20T12:00:00.000Z'),
} satisfies PaymentsReportReadModel;
