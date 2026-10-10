import { ReportRequestContextFactory } from '../../application/report-request-context.factory';
import { AgreementPaymentAgreementReportQueryAdapter } from './agreement-payment-agreement-report-query.adapter';
import { ClientServiceClientsListReportQueryAdapter } from './client-service-clients-list-report-query.adapter';
import { PrismaAccountStatementReportQueryAdapter } from './prisma-account-statement-report-query.adapter';
import { PrismaConnectionHistoryReportQueryAdapter } from './prisma-connection-history-report-query.adapter';
import { PrismaOverdueAccountsReportQueryAdapter } from './prisma-overdue-accounts-report-query.adapter';
import { PrismaPaymentsReportQueryAdapter } from './prisma-payments-report-query.adapter';
import { LEGACY_PAYMENT_AGREEMENT_FIXTURE } from '../../pdf/fixtures/legacy-report-contract.fixture';

const contextFactory = new ReportRequestContextFactory();
const actor = { usersId: 7 };

describe('typed report query specifications', () => {
  it('typedReportQuerySpecificationsMatchCanonicalData', async () => {
    const clients = await queryClients();
    const payments = await queryPayments();
    const connection = await queryConnectionHistory();
    const account = await queryAccountStatement();
    const overdue = await queryOverdueAccounts();
    const agreement = await queryPaymentAgreement();

    expect(clients.clients[0]).toEqual(
      expect.objectContaining({ identificacion: '0912345678', activo: true }),
    );
    expect(payments.payments[0].details[0]).toEqual(
      expect.objectContaining({
        billedPeriodName: 'ABRIL 2024',
        amount: 25,
      }),
    );
    expect(connection.invoices[0]).toEqual(
      expect.objectContaining({
        periodName: 'ENERO 2024',
        outstandingBalance: 20,
      }),
    );
    expect(account).toEqual(
      expect.objectContaining({
        contract: expect.objectContaining({
          guideNumber: 'G-001',
          baseValue: 4,
          excessValuePerM3: 0.5,
        }),
        periods: [
          expect.objectContaining({
            periodName: 'ENERO 2024',
            readings: [expect.objectContaining({ consumption: 5 })],
          }),
        ],
      }),
    );
    expect(overdue.invoices[0]).toEqual(
      expect.objectContaining({
        contractId: '10',
        outstandingBalance: 30,
        billedPeriodName: 'ENERO 2024',
      }),
    );
    expect(agreement).toEqual(LEGACY_PAYMENT_AGREEMENT_FIXTURE);
  });
});

async function queryClients() {
  const findAll = jest.fn().mockResolvedValue({
    data: [
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
    ],
  });
  const adapter = new ClientServiceClientsListReportQueryAdapter({
    findAll,
  } as never);
  const context = contextFactory.create({
    reportType: 'clients-list',
    actor,
    filters: { activo: true },
  });

  const result = await adapter.query(context);

  expect(findAll).toHaveBeenCalledWith({ activo: true, page: 1, limit: 9999 });
  return result;
}

async function queryPayments() {
  const findPayments = jest.fn().mockResolvedValue([
    {
      fechaPago: new Date('2024-05-20T15:00:00.000Z'),
      cliente: { nombres: 'Ana', apellidos: 'Pérez', razonSocial: null },
      detallePago: [
        {
          tipoPago: 'FACTURA',
          referencia: null,
          montoAbonado: 25,
          cuotaConvenio: null,
          comprobante: {
            secuencial: 'F-001',
            prefactura: {
              periodoRel: { nombre: 'ABRIL 2024' },
              contrato: {
                contratoId: 10n,
                historialMedidores: [{ medidor: { serie: 'M-001' } }],
              },
            },
          },
        },
      ],
    },
  ]);
  const findRecipient = jest
    .fn()
    .mockResolvedValue({ email: 'ana@example.com' });
  const adapter = new PrismaPaymentsReportQueryAdapter({
    pagos: { findMany: findPayments },
    clientes: { findUnique: findRecipient },
  } as never);
  const context = contextFactory.create({
    reportType: 'payments-report',
    actor,
    filters: {
      clienteId: '5',
      fechaDesde: '2024-05-01',
      fechaHasta: '2024-05-20',
    },
  });

  const result = await adapter.query(context);

  expect(findPayments).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        clienteId: 5n,
        fechaPago: {
          gte: new Date('2024-05-01T05:00:00.000Z'),
          lt: new Date('2024-05-21T05:00:00.000Z'),
        },
      }),
    }),
  );
  return result;
}

async function queryConnectionHistory() {
  const findContract = jest.fn().mockResolvedValue({
    cliente: {
      nombres: 'Ana',
      apellidos: 'Pérez',
      razonSocial: null,
      email: 'ana@example.com',
    },
    historialMedidores: [{ medidor: { serie: 'M-001' } }],
  });
  const findPreInvoices = jest.fn().mockResolvedValue([
    {
      periodoRel: { nombre: 'ENERO 2024' },
      lecturaActual: 10,
      lecturaAnterior: 5,
      consumoM3: 5,
      totalPagar: 50,
      abono: 30,
      saldoActual: 20,
    },
  ]);
  const adapter = new PrismaConnectionHistoryReportQueryAdapter({
    contratos: { findFirst: findContract },
    prefacturas: { findMany: findPreInvoices },
  } as never);
  const context = contextFactory.create({
    reportType: 'connection-history',
    actor,
    filters: {
      contratoId: '10',
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-01-31',
    },
  });

  const result = await adapter.query(context);

  expect(findPreInvoices).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        contratoId: 10n,
        periodoRel: {
          fechaInicio: { gte: new Date('2024-01-01T05:00:00.000Z') },
          fechaFin: { lt: new Date('2024-02-01T05:00:00.000Z') },
        },
      }),
    }),
  );
  return result;
}

async function queryAccountStatement() {
  const findContract = jest.fn().mockResolvedValue({
    numeroGuia: 'G-001',
    direccionSuministro: 'Olón',
    sector: { nombre: 'Sector Norte' },
    categoriaTarifaId: 2,
    categoriaTarifa: { nombre: 'Residencial', consumoMinimoMensual: 10 },
    cliente: {
      nombres: 'Ana',
      apellidos: 'Pérez',
      razonSocial: null,
      identificacion: '0912345678',
      email: 'ana@example.com',
    },
    historialMedidores: [{ medidorId: 3n, medidor: { serie: 'M-001' } }],
  });
  const findPreInvoices = jest.fn().mockResolvedValue([
    {
      periodoId: 1,
      periodoRel: { nombre: 'ENERO 2024' },
      abono: 20,
    },
  ]);
  const findReadings = jest.fn().mockResolvedValue([
    {
      periodoId: 1,
      fecha: new Date('2024-01-20T12:00:00.000Z'),
      lecturaActual: 10,
      lecturaAnterior: 5,
      consumoCalculado: 5,
    },
  ]);
  const findCharges = jest.fn().mockResolvedValue([
    { tipoRubro: 'FIJO', precioUnitario: 4 },
    { tipoRubro: 'VARIABLE', precioUnitario: 0.5 },
  ]);
  const adapter = new PrismaAccountStatementReportQueryAdapter({
    contratos: { findFirst: findContract },
    prefacturas: { findMany: findPreInvoices },
    lecturas: { findMany: findReadings },
    rubros: { findMany: findCharges },
  } as never);
  const context = contextFactory.create({
    reportType: 'account-statement',
    actor,
    filters: {
      contratoId: '10',
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-01-31',
    },
  });

  const result = await adapter.query(context);

  expect(findPreInvoices).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        contratoId: 10n,
        periodoRel: {
          fechaInicio: { gte: new Date('2024-01-01T05:00:00.000Z') },
          fechaFin: { lt: new Date('2024-02-01T05:00:00.000Z') },
        },
      }),
    }),
  );
  return result;
}

async function queryOverdueAccounts() {
  const findPreInvoices = jest.fn().mockResolvedValue([
    {
      contratoId: 10n,
      saldoActual: 30,
      periodoRel: { nombre: 'ENERO 2024' },
      contrato: {
        numeroGuia: 'G-001',
        cliente: {
          nombres: 'Ana',
          apellidos: 'Pérez',
          razonSocial: null,
          identificacion: '0912345678',
        },
        sector: { nombre: 'Sector Norte' },
        historialMedidores: [{ medidor: { serie: 'M-001' } }],
      },
    },
  ]);
  const adapter = new PrismaOverdueAccountsReportQueryAdapter({
    prefacturas: { findMany: findPreInvoices },
  } as never);
  const context = contextFactory.create({
    reportType: 'overdue-accounts',
    actor,
    filters: { contratoId: '10', fechaCorte: '2024-01-31' },
  });

  const result = await adapter.query(context);

  expect(findPreInvoices).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        contratoId: 10n,
        periodoRel: {
          fechaFin: { lte: new Date('2024-02-01T04:59:59.999Z') },
        },
      }),
    }),
  );
  return result;
}

async function queryPaymentAgreement() {
  const fixture = LEGACY_PAYMENT_AGREEMENT_FIXTURE.convenio;
  const findFirst = jest.fn().mockResolvedValue({
    convenioId: 1n,
    contratoId: 10n,
    deudaTotal: fixture.deudaTotal,
    abonoInicial: fixture.abonoInicial,
    numeroCuotas: fixture.numeroCuotas,
    fechaPrimerPago: new Date(fixture.fechaPrimerPago),
    motivo: fixture.motivo,
    createdAt: new Date(fixture.createdAt),
    contrato: {
      numeroGuia: fixture.contrato.numeroGuia,
      direccionSuministro: fixture.contrato.direccionSuministro,
      fechaInicio: new Date(fixture.periodoInicio),
      cliente: fixture.cliente,
    },
    cuotaConvenio: [{ valorCuota: fixture.cuotaMensual }],
  });
  const adapter = new AgreementPaymentAgreementReportQueryAdapter({
    convenios: { findFirst },
  } as any);
  const context = contextFactory.create({
    reportType: 'payment-agreement',
    actor,
    filters: { convenioId: '1' },
  });

  const result = await adapter.query(context);

  expect(findFirst).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { convenioId: 1n, deletedAt: null },
    }),
  );
  return result;
}
