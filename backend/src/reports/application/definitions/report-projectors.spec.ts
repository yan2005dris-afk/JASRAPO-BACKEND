import { projectConnectionHistoryReport } from './connection-history-report.definition';
import { projectPaymentAgreementReport } from './payment-agreement-report.definition';
import { projectPaymentsReport } from './payments-report.definition';

describe('typed report projectors', () => {
  it('connectionHistoryTotalSumsOutstandingBalances', () => {
    const result = projectConnectionHistoryReport({
      contractId: '88',
      client: null,
      meterSerial: null,
      invoices: [15, 25.5, 1].map((outstandingBalance) => ({
        periodName: null,
        currentReading: 0,
        previousReading: 0,
        consumption: 0,
        billedAmount: 0,
        paidAmount: 0,
        outstandingBalance,
      })),
      filters: { contratoId: '88' },
      recipientEmail: null,
      generatedAt: new Date('2024-05-20T00:00:00.000Z'),
    });

    expect(result.document.reporte.saldoFinal).toBe('41.50');
    expect(result.document.reporte.saldoFinal).not.toBe('1.00');
  });

  it('paymentAgreementUsesContractualStartPeriod', () => {
    const result = projectPaymentAgreementReport(buildAgreementReadModel());

    expect(result.document.convenio.periodoInicio).toBe('febrero de 2023');
    expect(result.document.convenio.periodoInicio).not.toBe('mayo de 2024');
  });

  it('paymentAgreementUsesContractualFirstInstallmentConcept', () => {
    const result = projectPaymentAgreementReport(buildAgreementReadModel());

    expect(result.document.convenio.primeraCuota).toBe('25.00');
    expect(result.document.convenio.primeraCuota).not.toBe(
      result.document.convenio.abonoInicial,
    );
  });

  it('paymentsReportEmissionUsesBilledPeriodName', () => {
    const result = projectPaymentsReport({
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

    expect(result.document.reporte.grupos[0].filas[0].emision).toBe(
      'ABRIL 2024',
    );
  });
});

function buildAgreementReadModel() {
  return {
    convenio: {
      convenioId: '1',
      contratoId: '10',
      createdAt: '2024-05-10T10:00:00.000Z',
      periodoInicio: '2023-02-01T00:00:00.000Z',
      fechaPrimerPago: '2024-06-01T00:00:00.000Z',
      cuotaMensual: 25,
      primeraCuota: 25,
      deudaTotal: 100,
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
  };
}
