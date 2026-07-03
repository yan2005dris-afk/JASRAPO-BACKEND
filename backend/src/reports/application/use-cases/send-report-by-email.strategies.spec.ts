jest.mock('puppeteer', () => ({}));
jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    createQueue: jest.fn(),
    send: jest.fn(),
    insert: jest.fn(),
    work: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PaymentsReportEmailStrategy } from './send-report-by-email.strategies';
import { ConnectionHistoryReportEmailStrategy } from './send-report-by-email.strategies';
import { PaymentAgreementReportEmailStrategy } from './send-report-by-email.strategies';
import { AccountStatementReportEmailStrategy } from './send-report-by-email.strategies';
import { ClientsListReportEmailStrategy } from './send-report-by-email.strategies';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PaymentsReportSpec } from '../../specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from '../../specs/connection-history.report-spec';
import { AccountStatementReportSpec } from '../../specs/account-statement.report-spec';
import { ClientsListReportSpec } from '../../specs/clients-list.report-spec';
import { GetPaymentAgreementPdfDataUseCase } from 'src/billing/collections/agreements/application/use-cases/get-payment-agreement-pdf-data.use-case';
import type { PaymentsReportFilterDto } from '../../dto/payments-report-filter.dto';
import type { ConnectionHistoryFilterDto } from '../../dto/connection-history-filter.dto';
import type { AccountStatementFilterDto } from '../../dto/account-statement-filter.dto';
import type { ClientsListReportFilterDto } from '../../dto/clients-list-report-filter.dto';

/**
 * Strategy-level specs. Each strategy exposes a `build()` factory that returns
 * a `ReportEmailStrategy<TFilters>` configured with:
 *   - `fetchSpec(filters)`: produces the spec data shape the PDF expects
 *   - `recipientResolver(filters)`: returns the client email, or null when none
 *   - `subjectBuilder(filters)`: builds the default subject
 *
 * Tests construct each strategy with mocks for its dependencies (PrismaService
 * and/or the relevant Spec class / GetPaymentAgreementPdfDataUseCase) and assert
 * the contract end-to-end: build() returns the right reportType key, the
 * resolver hits the right Prisma query with the right where+select, the subject
 * matches the agreed text, and fetchSpec delegates to the underlying spec.
 */
describe('Report email strategies (PR 2)', () => {
  describe('PaymentsReportEmailStrategy', () => {
    const buildCompiled = async (
      prisma: Partial<PrismaService>,
      spec: Partial<PaymentsReportSpec>,
    ): Promise<PaymentsReportEmailStrategy> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PaymentsReportEmailStrategy,
          { provide: PrismaService, useValue: prisma },
          { provide: PaymentsReportSpec, useValue: spec },
        ],
      }).compile();
      return module.get(PaymentsReportEmailStrategy);
    };

    it('build() exposes reportType = "payments-report"', async () => {
      const strategy = await buildCompiled({}, {});
      expect(strategy.build().reportType).toBe('payments-report');
    });

    it('subjectBuilder returns "Reporte de Abonos — Cliente #<clienteId>"', async () => {
      const strategy = await buildCompiled({}, {});
      const subject = strategy.build().subjectBuilder({
        clienteId: '42',
      });
      expect(subject).toBe('Reporte de Abonos — Cliente #42');
    });

    it('recipientResolver queries clientes by clienteId and returns the email', async () => {
      const findUnique = jest
        .fn()
        .mockResolvedValue({ email: 'jane@example.com' });
      const strategy = await buildCompiled(
        { clientes: { findUnique } } as unknown as PrismaService,
        {},
      );

      const email = await strategy.build().recipientResolver({
        clienteId: '7',
      });

      expect(findUnique).toHaveBeenCalledWith({
        where: { clienteId: BigInt('7') },
        select: { email: true },
      });
      expect(email).toBe('jane@example.com');
    });

    it('recipientResolver returns null when cliente.email is null', async () => {
      const findUnique = jest.fn().mockResolvedValue({ email: null });
      const strategy = await buildCompiled(
        { clientes: { findUnique } } as unknown as PrismaService,
        {},
      );

      const email = await strategy.build().recipientResolver({
        clienteId: '7',
      });

      expect(email).toBeNull();
    });

    it('recipientResolver returns null when cliente is not found', async () => {
      const findUnique = jest.fn().mockResolvedValue(null);
      const strategy = await buildCompiled(
        { clientes: { findUnique } } as unknown as PrismaService,
        {},
      );

      const email = await strategy.build().recipientResolver({
        clienteId: '99',
      });

      expect(email).toBeNull();
    });

    it('fetchSpec delegates to PaymentsReportSpec.fetchData', async () => {
      const fetchData = jest.fn().mockResolvedValue({
        pagos: [{ factura: 'F1', valorNum: 10 }],
        totalGeneral: '10.00',
        totalRegistros: 1,
      });
      const strategy = await buildCompiled({}, { fetchData });

      const filters = {
        clienteId: '7',
        fechaDesde: '2024-01-01',
      } as PaymentsReportFilterDto;
      const data = await strategy.build().fetchSpec(filters);

      expect(fetchData).toHaveBeenCalledWith(filters);
      expect(data).toEqual({
        pagos: [{ factura: 'F1', valorNum: 10 }],
        totalGeneral: '10.00',
        totalRegistros: 1,
      });
    });
  });

  describe('ConnectionHistoryReportEmailStrategy', () => {
    const buildCompiled = async (
      prisma: Partial<PrismaService>,
      spec: Partial<ConnectionHistoryReportSpec>,
    ): Promise<ConnectionHistoryReportEmailStrategy> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ConnectionHistoryReportEmailStrategy,
          { provide: PrismaService, useValue: prisma },
          { provide: ConnectionHistoryReportSpec, useValue: spec },
        ],
      }).compile();
      return module.get(ConnectionHistoryReportEmailStrategy);
    };

    it('build() exposes reportType = "connection-history"', async () => {
      const strategy = await buildCompiled({}, {});
      expect(strategy.build().reportType).toBe('connection-history');
    });

    it('subjectBuilder returns "Historial de Conexión — Contrato #<contratoId>"', async () => {
      const strategy = await buildCompiled({}, {});
      const subject = strategy.build().subjectBuilder({
        contratoId: '5',
      });
      expect(subject).toBe('Historial de Conexión — Contrato #5');
    });

    it('recipientResolver queries contratos + cliente.email in a single query', async () => {
      const findUnique = jest
        .fn()
        .mockResolvedValue({ cliente: { email: 'conn@example.com' } });
      const strategy = await buildCompiled(
        { contratos: { findUnique } } as unknown as PrismaService,
        {},
      );

      const email = await strategy.build().recipientResolver({
        contratoId: '5',
      });

      expect(findUnique).toHaveBeenCalledWith({
        where: { contratoId: BigInt('5') },
        select: { cliente: { select: { email: true } } },
      });
      expect(email).toBe('conn@example.com');
    });

    it('recipientResolver returns null when contrato or cliente.email is null', async () => {
      const findUnique = jest.fn().mockResolvedValue(null);
      const strategy = await buildCompiled(
        { contratos: { findUnique } } as unknown as PrismaService,
        {},
      );

      const email = await strategy.build().recipientResolver({
        contratoId: '5',
      });

      expect(email).toBeNull();
    });

    it('fetchSpec delegates to ConnectionHistoryReportSpec.fetchData', async () => {
      const fetchData = jest
        .fn()
        .mockResolvedValue({ contratoId: '5', prefacturas: [] });
      const strategy = await buildCompiled({}, { fetchData });

      const filters = {
        contratoId: '5',
      } as ConnectionHistoryFilterDto;
      const data = await strategy.build().fetchSpec(filters);

      expect(fetchData).toHaveBeenCalledWith(filters);
      expect(data).toEqual({ contratoId: '5', prefacturas: [] });
    });
  });

  describe('PaymentAgreementReportEmailStrategy', () => {
    const buildCompiled = async (
      prisma: Partial<PrismaService>,
      pdfData: Partial<GetPaymentAgreementPdfDataUseCase>,
    ): Promise<PaymentAgreementReportEmailStrategy> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PaymentAgreementReportEmailStrategy,
          { provide: PrismaService, useValue: prisma },
          {
            provide: GetPaymentAgreementPdfDataUseCase,
            useValue: pdfData,
          },
        ],
      }).compile();
      return module.get(PaymentAgreementReportEmailStrategy);
    };

    it('build() exposes reportType = "payment-agreement"', async () => {
      const strategy = await buildCompiled({}, {});
      expect(strategy.build().reportType).toBe('payment-agreement');
    });

    it('subjectBuilder returns "Convenio de Pago #<convenioId>"', async () => {
      const strategy = await buildCompiled({}, {});
      const subject = strategy.build().subjectBuilder({ convenioId: '9' });
      expect(subject).toBe('Convenio de Pago #9');
    });

    it('fetchSpec delegates to GetPaymentAgreementPdfDataUseCase.execute with BigInt(convenioId)', async () => {
      const execute = jest
        .fn()
        .mockResolvedValue({ convenio: { convenioId: '9', cliente: {} } });
      const strategy = await buildCompiled({}, { execute });

      const data = await strategy.build().fetchSpec({ convenioId: '9' });

      expect(execute).toHaveBeenCalledWith(BigInt('9'));
      expect(data).toEqual({ convenio: { convenioId: '9', cliente: {} } });
    });

    it('recipientResolver queries convenios + contrato + cliente.email in a single query', async () => {
      const findUnique = jest.fn().mockResolvedValue({
        contrato: { cliente: { email: 'agreem@example.com' } },
      });
      const strategy = await buildCompiled(
        { convenios: { findUnique } } as unknown as PrismaService,
        {},
      );

      const email = await strategy.build().recipientResolver({
        convenioId: '9',
      });

      expect(findUnique).toHaveBeenCalledWith({
        where: { convenioId: BigInt('9') },
        select: {
          contrato: { select: { cliente: { select: { email: true } } } },
        },
      });
      expect(email).toBe('agreem@example.com');
    });

    it('recipientResolver returns null when convenio or cliente.email is null', async () => {
      const findUnique = jest.fn().mockResolvedValue(null);
      const strategy = await buildCompiled(
        { convenios: { findUnique } } as unknown as PrismaService,
        {},
      );

      const email = await strategy.build().recipientResolver({
        convenioId: '9',
      });

      expect(email).toBeNull();
    });
  });

  describe('AccountStatementReportEmailStrategy', () => {
    const buildCompiled = async (
      prisma: Partial<PrismaService>,
      spec: Partial<AccountStatementReportSpec>,
    ): Promise<AccountStatementReportEmailStrategy> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccountStatementReportEmailStrategy,
          { provide: PrismaService, useValue: prisma },
          { provide: AccountStatementReportSpec, useValue: spec },
        ],
      }).compile();
      return module.get(AccountStatementReportEmailStrategy);
    };

    it('build() exposes reportType = "account-statement"', async () => {
      const strategy = await buildCompiled({}, {});
      expect(strategy.build().reportType).toBe('account-statement');
    });

    it('subjectBuilder returns "Estado de Cuenta — Contrato #<contratoId>"', async () => {
      const strategy = await buildCompiled({}, {});
      const subject = strategy.build().subjectBuilder({
        contratoId: '12',
      });
      expect(subject).toBe('Estado de Cuenta — Contrato #12');
    });

    it('recipientResolver prefers specData.contrato.cliente.email from the spec (no extra query)', async () => {
      const fetchData = jest.fn().mockResolvedValue({
        contratoId: '12',
        contrato: { cliente: { email: 'account@example.com' } },
        periods: [],
      });
      const findUnique = jest.fn();
      const strategy = await buildCompiled(
        { contratos: { findUnique } } as unknown as PrismaService,
        { fetchData },
      );

      const data = await strategy.build().fetchSpec({
        contratoId: '12',
      });
      const email = await strategy
        .build()
        .recipientResolver({ contratoId: '12' }, data);

      expect(findUnique).not.toHaveBeenCalled();
      expect(email).toBe('account@example.com');
    });

    it('recipientResolver falls back to a Prisma query when spec data lacks the email', async () => {
      const fetchData = jest.fn().mockResolvedValue({
        contratoId: '12',
        contrato: { cliente: { email: null } },
        periods: [],
      });
      const findUnique = jest
        .fn()
        .mockResolvedValue({ cliente: { email: 'fallback@example.com' } });
      const strategy = await buildCompiled(
        { contratos: { findUnique } } as unknown as PrismaService,
        { fetchData },
      );

      const email = await strategy.build().recipientResolver(
        { contratoId: '12' },
        {
          contratoId: '12',
          contrato: { cliente: { email: null } },
        },
      );

      expect(findUnique).toHaveBeenCalledWith({
        where: { contratoId: BigInt('12') },
        select: { cliente: { select: { email: true } } },
      });
      expect(email).toBe('fallback@example.com');
    });

    it('fetchSpec delegates to AccountStatementReportSpec.fetchData', async () => {
      const fetchData = jest.fn().mockResolvedValue({
        contratoId: '12',
        contrato: { cliente: { email: 'a@b.c' } },
        periods: [],
      });
      const strategy = await buildCompiled({}, { fetchData });

      const filters = { contratoId: '12' } as AccountStatementFilterDto;
      const data = await strategy.build().fetchSpec(filters);

      expect(fetchData).toHaveBeenCalledWith(filters);
      expect(data).toEqual({
        contratoId: '12',
        contrato: { cliente: { email: 'a@b.c' } },
        periods: [],
      });
    });
  });

  describe('ClientsListReportEmailStrategy', () => {
    const buildCompiled = async (
      spec: Partial<ClientsListReportSpec>,
    ): Promise<ClientsListReportEmailStrategy> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ClientsListReportEmailStrategy,
          { provide: ClientsListReportSpec, useValue: spec },
        ],
      }).compile();
      return module.get(ClientsListReportEmailStrategy);
    };

    it('build() exposes reportType = "clients-list"', async () => {
      const strategy = await buildCompiled({});
      expect(strategy.build().reportType).toBe('clients-list');
    });

    it('subjectBuilder returns "Listado de Clientes" when activo is undefined or true', async () => {
      const strategy = await buildCompiled({});
      expect(strategy.build().subjectBuilder({})).toBe('Listado de Clientes');
      expect(strategy.build().subjectBuilder({ activo: true })).toBe(
        'Listado de Clientes',
      );
    });

    it('subjectBuilder returns "Listado de Clientes (Inactivos)" when activo is false', async () => {
      const strategy = await buildCompiled({});
      expect(strategy.build().subjectBuilder({ activo: false })).toBe(
        'Listado de Clientes (Inactivos)',
      );
    });

    it('recipientResolver always returns null (caller must supply destinatarioOverride)', async () => {
      const strategy = await buildCompiled({});
      const email = await strategy.build().recipientResolver({});
      expect(email).toBeNull();
    });

    it('fetchSpec extracts nested "filtros" when present and passes it to ClientsListReportSpec.fetchData', async () => {
      const fetchData = jest
        .fn()
        .mockResolvedValue({ clientes: [], fecha: 'today' });
      const strategy = await buildCompiled({
        fetchData,
      });

      const inner = {
        nombres: 'Jane',
        activo: true,
      } as ClientsListReportFilterDto;
      const data = await strategy.build().fetchSpec({ filtros: inner });

      expect(fetchData).toHaveBeenCalledWith(inner);
      expect(data).toEqual({ clientes: [], fecha: 'today' });
    });

    it('fetchSpec passes filters through directly when no nested "filtros" key', async () => {
      const fetchData = jest
        .fn()
        .mockResolvedValue({ clientes: [], fecha: 'today' });
      const strategy = await buildCompiled({
        fetchData,
      });

      const flat = { activo: true } as ClientsListReportFilterDto;
      const data = await strategy.build().fetchSpec(flat);

      expect(fetchData).toHaveBeenCalledWith(flat);
      expect(data).toEqual({ clientes: [], fecha: 'today' });
    });
  });
});
