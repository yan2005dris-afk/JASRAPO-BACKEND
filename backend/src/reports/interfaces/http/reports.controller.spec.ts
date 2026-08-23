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
import { Reflector } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import {
  ExecutionContext,
  HttpException,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { UseGuards, applyDecorators } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import request from 'supertest';
import { ReportsController } from './reports.controller';
import { PdfService } from '../../../infrastructure/pdf/pdf.service';
import { GeneratePdfUseCase } from '../../../infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ClientsListReportSpec } from '../../infrastructure/specs/clients-list.report-spec';
import { PaymentsReportSpec } from '../../infrastructure/specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from '../../infrastructure/specs/connection-history.report-spec';
import { AccountStatementReportSpec } from '../../infrastructure/specs/account-statement.report-spec';
import { OverdueAccountsReportSpec } from '../../infrastructure/specs/overdue-accounts.report-spec';
import { GetPaymentAgreementPdfDataUseCase } from '../../../billing/collections/agreements/application/use-cases/get-payment-agreement-pdf-data.use-case';
import { ReportStyleDispatcher } from '../../application/report-style.dispatcher';
import { SendReportByEmailUseCase } from '../../application/use-cases/send-report-by-email.use-case';
import type { ReportEmailStrategy } from '../../application/use-cases/send-report-by-email.strategy';
import type { MailService } from '../../../infrastructure/mail/application/mail.service';
import { ReportStyleService } from '../../application/report-style.service';
import { JwtAuthGuard } from '../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from '../../../infrastructure/common/decorators/require-permission.decorator';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

/**
 * Helpers to introspect the class-level `@UseGuards` + `@ApiBearerAuth` decorators.
 * The `applyDecorators` -> `getMetadata` chain is the standard NestJS pattern for
 * assertion-level tests of controller metadata.
 */
function readClassLevelDecorators(
  target: abstract new (...args: never[]) => unknown,
) {
  return {
    guards: Reflect.getMetadata('__guards__', target) ?? [],
    apiBearerAuth: Reflect.getMetadata('swagger/apiSecurity', target),
    apiTags: Reflect.getMetadata('swagger/apiUseTags', target),
  };
}

describe('ReportsController — class-level auth wiring (REQ-5)', () => {
  it('declares JwtAuthGuard + PermissionsGuard at the class level', () => {
    const guards = readClassLevelDecorators(ReportsController).guards;
    expect(Array.isArray(guards)).toBe(true);
    const guardClasses = (guards as unknown[]).map(
      (g) => (g as { name?: string }).name,
    );
    expect(guardClasses).toContain('JwtAuthGuard');
    expect(guardClasses).toContain('PermissionsGuard');
  });

  it('declares ApiBearerAuth at the class level for OpenAPI docs', () => {
    const security = readClassLevelDecorators(ReportsController).apiBearerAuth;
    expect(security).toBeDefined();
  });

  it('declares ApiTags("reports") for OpenAPI grouping', () => {
    const tags = readClassLevelDecorators(ReportsController).apiTags;
    expect(tags).toEqual(['reports']);
  });
});

describe('ReportsController — consolidated endpoints exist (REQ-1/2/3, REQ-9, REQ-10)', () => {
  it('exposes exactly 6 @Get handlers (5 consolidated + overdue-accounts)', () => {
    // Walk the prototype chain to enumerate `@Get` route paths.
    const paths = collectGetPaths(ReportsController.prototype);
    expect(paths).toHaveLength(6);
    expect(paths.map((p) => p.toLowerCase())).toEqual(
      expect.arrayContaining([
        'payments-report',
        'connection-history',
        'payment-agreement',
        'clients-list',
        'account-statement',
        'overdue-accounts',
      ]),
    );
  });

  it('does NOT expose any of the 6 deleted legacy/modern endpoints', () => {
    const paths = collectGetPaths(ReportsController.prototype).map((p) =>
      p.toLowerCase(),
    );
    for (const deleted of [
      'payments-report-legacy',
      'payments-report-modern',
      'connection-history-legacy',
      'connection-history-modern',
      'payment-agreement-legacy',
      'payment-agreement-modern',
    ]) {
      expect(paths).not.toContain(deleted);
    }
  });

  it('keeps the 2 untouched endpoints untouched (clients-list + account-statement)', () => {
    const paths = collectGetPaths(ReportsController.prototype);
    expect(paths).toContain('clients-list');
    expect(paths).toContain('account-statement');
  });
});

describe('ReportsController — per-endpoint permission (REQ-6)', () => {
  it.each([
    'paymentsReportPdf',
    'connectionHistoryPdf',
    'paymentAgreementPdf',
    'clientsListPdf',
    'accountStatementPdf',
  ])(
    'decorates %s with RequiredPermission("reportes","read")',
    (methodName) => {
      const metadata = Reflect.getMetadata(
        'permission',
        ReportsController.prototype[methodName],
      );
      expect(metadata).toEqual({ recurso: 'reportes', accion: 'read' });
    },
  );
});

describe('ReportsController — handler wiring (REQ-1/2/3 + dispatcher)', () => {
  let controller: ReportsController;
  let dispatcher: jest.Mocked<ReportStyleDispatcher>;
  let paymentsSpec: jest.Mocked<PaymentsReportSpec>;
  let connectionSpec: jest.Mocked<ConnectionHistoryReportSpec>;
  let paymentAgreementPdfData: jest.Mocked<GetPaymentAgreementPdfDataUseCase>;
  let clientsSpec: jest.Mocked<ClientsListReportSpec>;
  let accountSpec: jest.Mocked<AccountStatementReportSpec>;
  let generatePdf: { execute: jest.Mock };
  let pdfService: {
    getAvailableTypes: jest.Mock;
    getDocumentType: jest.Mock;
    render: jest.Mock;
  };
  // Cast helper — the existing controller still wires `PdfService` + `GeneratePdfUseCase`.
  // The new controller will likely drop the GeneratePdfUseCase and use only the dispatcher.
  // Both flows are covered.

  const FAKE_PDF = Buffer.from('%PDF-1.4 fake');

  const mockRes = (acceptHeader?: string) => {
    // Minimal Express response surface — only what the controller uses.
    // `req.headers.accept` is read from the response object (Express puts the
    // request as `res.req`); pass `acceptHeader` to simulate a negotiated
    // request. Default = no header → controller falls back to PDF.
    const req = {
      headers: {
        ...(acceptHeader !== undefined ? { accept: acceptHeader } : {}),
      },
    };
    const res = {
      set: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req,
    };
    return res as unknown as ExpressResponse;
  };

  beforeEach(async () => {
    generatePdf = { execute: jest.fn() };
    pdfService = {
      getAvailableTypes: jest.fn(),
      getDocumentType: jest.fn(),
      render: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        {
          provide: PdfService,
          useValue: pdfService,
        },
        {
          provide: GeneratePdfUseCase,
          useValue: generatePdf,
        },
        {
          provide: ClientsListReportSpec,
          useValue: { fetchData: jest.fn(), type: 'clients-list' },
        },
        {
          provide: PaymentsReportSpec,
          useValue: { fetchData: jest.fn(), type: 'payments-report' },
        },
        {
          provide: ConnectionHistoryReportSpec,
          useValue: { fetchData: jest.fn(), type: 'connection-history' },
        },
        {
          provide: AccountStatementReportSpec,
          useValue: { fetchData: jest.fn(), type: 'account-statement' },
        },
        {
          provide: OverdueAccountsReportSpec,
          useValue: { fetchData: jest.fn(), type: 'overdue-accounts' },
        },
        {
          provide: GetPaymentAgreementPdfDataUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ReportStyleService,
          useValue: { resolveStyle: jest.fn() },
        },
        {
          provide: ReportStyleDispatcher,
          useValue: { dispatch: jest.fn() },
        },
        {
          provide: SendReportByEmailUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              queued: true,
              jobId: 'j1',
              destinatario: 'x@y.z',
              subject: 's',
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    dispatcher = module.get(ReportStyleDispatcher);
    paymentsSpec = module.get(PaymentsReportSpec);
    connectionSpec = module.get(ConnectionHistoryReportSpec);
    paymentAgreementPdfData = module.get(GetPaymentAgreementPdfDataUseCase);
    clientsSpec = module.get(ClientsListReportSpec);
    accountSpec = module.get(AccountStatementReportSpec);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('paymentsReportPdf: calls PaymentsReportSpec then dispatcher, then writes the JSON (API default)', async () => {
    paymentsSpec.fetchData.mockResolvedValue({ pagos: [] });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payments-report-auto.pdf',
    });
    const res = mockRes();

    await controller.paymentsReportPdf({}, res);

    expect(paymentsSpec.fetchData).toHaveBeenCalledWith({});
    expect(dispatcher.dispatch).toHaveBeenCalledWith('payments-report', {
      pagos: [],
    });
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': expect.stringContaining('application/json'),
        'Content-Disposition': expect.stringContaining('payments-report'),
      }),
    );
    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({ pagos: [] }, expect.any(Function)),
    );
  });

  it('connectionHistoryPdf: calls ConnectionHistoryReportSpec then dispatcher', async () => {
    connectionSpec.fetchData.mockResolvedValue({
      reporte: { clienteNombre: 'Acme' },
      prefacturas: [],
    });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'connection-history-auto.pdf',
    });
    const res = mockRes();

    await controller.connectionHistoryPdf({ contratoId: '42' }, res);

    expect(connectionSpec.fetchData).toHaveBeenCalledWith({
      contratoId: '42',
    });
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'connection-history',
      expect.objectContaining({ prefacturas: [] }),
    );
  });

  it('paymentAgreementPdf: calls GetPaymentAgreementPdfDataUseCase then dispatcher', async () => {
    paymentAgreementPdfData.execute.mockResolvedValue({
      convenio: {
        convenioId: '1',
        contratoId: '5',
        deudaTotal: 500,
        abonoInicial: 100,
        numeroCuotas: 4,
        fechaPrimerPago: '2024-06-01T00:00:00.000Z',
        motivo: 'Deuda acumulada',
        createdAt: '2024-05-10T00:00:00.000Z',
        cuotaMensual: 100,
        contrato: {
          numeroGuia: 'NG-001',
          direccionSuministro: 'Av. Principal 123',
        },
        cliente: {
          nombres: 'María',
          apellidos: 'García',
          razonSocial: null,
          identificacion: '0912345678',
        },
      },
    });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payment-agreement-auto.pdf',
    });
    const res = mockRes();

    await controller.paymentAgreementPdf({ convenioId: '1' }, res);

    expect(paymentAgreementPdfData.execute).toHaveBeenCalledWith(BigInt(1));
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'payment-agreement',
      expect.objectContaining({
        convenio: expect.objectContaining({ convenioId: '1' }),
      }),
    );
  });

  it('clientsListPdf: routes through the dispatcher', async () => {
    clientsSpec.fetchData.mockResolvedValue({ clientes: [] });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'clients-list-auto.pdf',
    });
    const res = mockRes();

    await controller.clientsListPdf({}, res);

    expect(clientsSpec.fetchData).toHaveBeenCalledWith({});
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'clients-list',
      expect.objectContaining({ clientes: [] }),
    );
  });

  it('accountStatementPdf: routes through the dispatcher', async () => {
    accountSpec.fetchData.mockResolvedValue({
      reporte: { clienteNombre: 'Acme' },
    });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'account-statement-auto.pdf',
    });
    const res = mockRes();

    await controller.accountStatementPdf({ contratoId: '42' }, res);

    expect(accountSpec.fetchData).toHaveBeenCalledWith({
      contratoId: '42',
    });
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'account-statement',
      expect.objectContaining({ reporte: expect.any(Object) }),
    );
  });
});

describe('ReportsController — content negotiation (Accept header)', () => {
  let controller: ReportsController;
  let paymentsSpec: jest.Mocked<Pick<PaymentsReportSpec, 'fetchData'>>;
  let dispatcher: jest.Mocked<Pick<ReportStyleDispatcher, 'dispatch'>>;
  let clientsSpec: jest.Mocked<Pick<ClientsListReportSpec, 'fetchData'>>;
  let generatePdf: jest.Mocked<Pick<GeneratePdfUseCase, 'execute'>>;

  const FAKE_PDF = Buffer.from('%PDF-1.4 fake');

  const mockRes = (acceptHeader?: string) => {
    const req = {
      headers: {
        ...(acceptHeader !== undefined ? { accept: acceptHeader } : {}),
      },
    };
    const res = {
      set: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req,
    };
    return res as unknown as ExpressResponse;
  };

  beforeEach(async () => {
    generatePdf = { execute: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        {
          provide: PdfService,
          useValue: { getDocumentType: jest.fn(), render: jest.fn() },
        },
        { provide: GeneratePdfUseCase, useValue: generatePdf },
        {
          provide: ClientsListReportSpec,
          useValue: { fetchData: jest.fn(), type: 'clients-list' },
        },
        {
          provide: PaymentsReportSpec,
          useValue: { fetchData: jest.fn(), type: 'payments-report' },
        },
        {
          provide: ConnectionHistoryReportSpec,
          useValue: { fetchData: jest.fn(), type: 'connection-history' },
        },
        {
          provide: AccountStatementReportSpec,
          useValue: { fetchData: jest.fn(), type: 'account-statement' },
        },
        {
          provide: OverdueAccountsReportSpec,
          useValue: { fetchData: jest.fn(), type: 'overdue-accounts' },
        },
        {
          provide: GetPaymentAgreementPdfDataUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ReportStyleService,
          useValue: { resolveStyle: jest.fn() },
        },
        {
          provide: ReportStyleDispatcher,
          useValue: { dispatch: jest.fn() },
        },
        {
          provide: SendReportByEmailUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              queued: true,
              jobId: 'j1',
              destinatario: 'x@y.z',
              subject: 's',
            }),
          },
        },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: PermissionsGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    paymentsSpec = module.get(PaymentsReportSpec);
    dispatcher = module.get(ReportStyleDispatcher);
    clientsSpec = module.get(ClientsListReportSpec);
  });

  it('returns JSON when no Accept header is sent (API default)', async () => {
    paymentsSpec.fetchData.mockResolvedValue({ pagos: [] });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payments-report.pdf',
    });
    const res = mockRes();

    await controller.paymentsReportPdf({}, res);

    expect(res.end).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': expect.stringContaining('application/json'),
      }),
    );
    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({ pagos: [] }, expect.any(Function)),
    );
  });

  it('returns JSON when Accept: application/json is sent', async () => {
    const rawData = { pagos: [{ id: 1, valor: 100 }] };
    paymentsSpec.fetchData.mockResolvedValue(rawData);
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payments-report.pdf',
    });
    const res = mockRes('application/json');

    await controller.paymentsReportPdf({}, res);

    expect(res.end).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': expect.stringContaining('application/json'),
      }),
    );
    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify(rawData, expect.any(Function)),
    );
  });

  it('returns JSON when both application/json and application/pdf are sent (JSON wins — API default)', async () => {
    paymentsSpec.fetchData.mockResolvedValue({ pagos: [] });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payments-report.pdf',
    });
    const res = mockRes('application/json, application/pdf');

    await controller.paymentsReportPdf({}, res);

    expect(res.end).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({ pagos: [] }, expect.any(Function)),
    );
  });

  it('returns JSON when wildcard Accept is sent (Apidog / generic client default)', async () => {
    paymentsSpec.fetchData.mockResolvedValue({ pagos: [] });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payments-report.pdf',
    });
    const res = mockRes('*/*');

    await controller.paymentsReportPdf({}, res);

    expect(res.end).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({ pagos: [] }, expect.any(Function)),
    );
  });

  it('returns JSON when browser-style Accept is sent (text/html, application/xml, */*;q=0.8)', async () => {
    paymentsSpec.fetchData.mockResolvedValue({ pagos: [] });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payments-report.pdf',
    });
    const res = mockRes(
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    );

    await controller.paymentsReportPdf({}, res);

    expect(res.end).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({ pagos: [] }, expect.any(Function)),
    );
  });

  it('returns PDF when Accept: application/pdf is sent (explicit opt-in for emails)', async () => {
    paymentsSpec.fetchData.mockResolvedValue({ pagos: [] });
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'payments-report.pdf',
    });
    const res = mockRes('application/pdf');

    await controller.paymentsReportPdf({}, res);

    expect(res.send).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'application/pdf' }),
    );
    expect(res.end).toHaveBeenCalledWith(FAKE_PDF);
  });

  it('clientsListPdf: returns PDF only with explicit Accept: application/pdf', async () => {
    const rawData = { clientes: [{ id: 1, nombre: 'Acme' }] };
    clientsSpec.fetchData.mockResolvedValue(rawData);
    dispatcher.dispatch.mockResolvedValue({
      buffer: FAKE_PDF,
      filename: 'clients-list.pdf',
    });
    const res = mockRes('application/pdf');

    await controller.clientsListPdf({}, res);

    expect(res.end).toHaveBeenCalledWith(FAKE_PDF);
    expect(res.send).not.toHaveBeenCalled();
  });
});

/**
 * Walks every method on a controller prototype looking for `@Get` route metadata.
 * Works for class-level + method-level decorators because Nest stores the resolved
 * path under the same key (`method`).
 */
function collectGetPaths(proto: object): string[] {
  const paths: string[] = [];
  let target: object | null = proto;
  while (target && target !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(target)) {
      if (name === 'constructor') continue;
      const member = (target as Record<string, unknown>)[name] as object;
      const p = Reflect.getMetadata('path', member);
      const method = Reflect.getMetadata('method', member);
      if (p && (method === 'GET' || method === 0)) {
        paths.push(
          typeof p === 'string' ? p : (p as { toString(): string }).toString(),
        );
      }
    }
    target = Object.getPrototypeOf(target);
  }
  return paths;
}
// has no id; its required `destinatario` is covered separately below).
const ENVELOPE = {
  queued: true,
  jobId: 'job-abc',
  destinatario: 'client@example.com',
  subject: 'Reporte de Abonos — Cliente #1',
} as const;

const ROUTE_CASES = [
  {
    path: '/reports/payments-report/email',
    reportType: 'payments-report',
    validBody: { clienteId: '1' },
    missingRequiredField: 'clienteId' as const,
  },
  {
    path: '/reports/connection-history/email',
    reportType: 'connection-history',
    validBody: { contratoId: '7' },
    missingRequiredField: 'contratoId' as const,
  },
  {
    path: '/reports/payment-agreement/email',
    reportType: 'payment-agreement',
    validBody: { convenioId: '9' },
    missingRequiredField: 'convenioId' as const,
  },
  {
    path: '/reports/account-statement/email',
    reportType: 'account-statement',
    validBody: { contratoId: '12' },
    missingRequiredField: 'contratoId' as const,
  },
  {
    path: '/reports/clients/email',
    reportType: 'clients-list',
    validBody: { destinatario: 'ops@example.com' },
    missingRequiredField: null,
  },
] as const;

describe('ReportsController — POST /email routes (PR 3)', () => {
  let app: INestApplication;
  let executeMock: jest.Mock;

  const buildApp = async (
    permissionsResult: boolean | Error = true,
  ): Promise<INestApplication> => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        {
          provide: SendReportByEmailUseCase,
          useValue: { execute: executeMock },
        },
        { provide: PdfService, useValue: {} },
        { provide: GeneratePdfUseCase, useValue: {} },
        { provide: ClientsListReportSpec, useValue: {} },
        { provide: PaymentsReportSpec, useValue: {} },
        { provide: ConnectionHistoryReportSpec, useValue: {} },
        { provide: AccountStatementReportSpec, useValue: {} },
        { provide: OverdueAccountsReportSpec, useValue: {} },
        {
          provide: GetPaymentAgreementPdfDataUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: ReportStyleDispatcher, useValue: { dispatch: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({
        canActivate: () => {
          if (permissionsResult instanceof Error) throw permissionsResult;
          return permissionsResult;
        },
      })
      .compile();
    const a = moduleRef.createNestApplication();
    a.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await a.init();
    return a;
  };

  beforeAll(async () => {
    executeMock = jest.fn().mockResolvedValue(ENVELOPE);
    app = await buildApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => {
    executeMock.mockClear();
  });

  describe.each(ROUTE_CASES)(
    'POST $path',
    ({ path, reportType, validBody, missingRequiredField }) => {
      it('returns 200 with the queued envelope and forwards filters to the use case', async () => {
        const res = await request(app.getHttpServer())
          .post(path)
          .send(validBody)
          .expect(200);
        expect(res.body).toEqual(ENVELOPE);
        expect(executeMock).toHaveBeenCalledTimes(1);
        const call = executeMock.mock.calls[0][0];
        expect(call.reportType).toBe(reportType);
        if (reportType === 'clients-list') {
          expect(call.filters).toEqual({});
          expect(call.destinatarioOverride).toBe('ops@example.com');
        } else {
          expect(call.filters).toEqual(validBody);
          expect(call.destinatarioOverride).toBeUndefined();
        }
        expect(call.subjectOverride).toBeUndefined();
      });

      it('returns 400 when the required route-specific id is missing', async () => {
        if (missingRequiredField === null) return;
        const body = { ...validBody };
        delete body[missingRequiredField];
        await request(app.getHttpServer()).post(path).send(body).expect(400);
        expect(executeMock).not.toHaveBeenCalled();
      });

      it('returns 400 for an unknown body field (forbidNonWhitelisted)', async () => {
        await request(app.getHttpServer())
          .post(path)
          .send({ ...validBody, garbage: 'x' })
          .expect(400);
        expect(executeMock).not.toHaveBeenCalled();
      });

      it('forwards destinatarioOverride and subjectOverride to the use case', async () => {
        await request(app.getHttpServer())
          .post(path)
          .send({
            ...validBody,
            destinatario: 'override@example.com',
            subject: 'Custom subject',
          })
          .expect(200);
        expect(executeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            reportType,
            destinatarioOverride: 'override@example.com',
            subjectOverride: 'Custom subject',
          }),
        );
      });
    },
  );

  // clients-list only: `destinatario` is REQUIRED on this route.
  it('POST /reports/clients/email returns 400 when destinatario is missing', async () => {
    await request(app.getHttpServer())
      .post('/reports/clients/email')
      .send({})
      .expect(400);
    expect(executeMock).not.toHaveBeenCalled();
  });

  // Permission gating — verify PermissionsGuard denial flows through.
  it('returns 403 when PermissionsGuard denies access', async () => {
    const denyApp = await buildApp(
      new ForbiddenException('No tienes permiso para reportes'),
    );
    try {
      await request(denyApp.getHttpServer())
        .post('/reports/payments-report/email')
        .send({ clienteId: '1' })
        .expect(403);
    } finally {
      await denyApp.close();
    }
  });
});

// ---------------------------------------------------------------------------
// PR 4 — PDF-generation timeout integration test.
// Uses a real SendReportByEmailUseCase wired with a tiny `pdfTimeoutMs` so
// the test runs in milliseconds, and mocks ReportStyleDispatcher.dispatch to
// return a promise that never resolves. The use case must convert the
// underlying TimeoutError into a ServiceUnavailableException (HTTP 503),
// and the controller must surface it correctly.
// ---------------------------------------------------------------------------
describe('ReportsController — PDF generation timeout (PR 4)', () => {
  let slowApp: INestApplication;
  let slowPdfDispatch: jest.Mock;

  beforeAll(async () => {
    slowPdfDispatch = jest.fn().mockImplementation(
      () => new Promise<Buffer>(() => undefined), // never resolves
    );

    const realUseCase = new SendReportByEmailUseCase(
      { sendReport: jest.fn() } as unknown as MailService,
      { dispatch: slowPdfDispatch } as unknown as ReportStyleDispatcher,
      {
        'payments-report': {
          reportType: 'payments-report',
          recipientResolver: jest.fn().mockResolvedValue('client@example.com'),
          subjectBuilder: jest
            .fn()
            .mockReturnValue('Reporte de Abonos — Cliente #1'),
          fetchSpec: jest.fn().mockResolvedValue({ pagos: [] }),
        } satisfies ReportEmailStrategy<Record<string, unknown>>,
      },
      // 30ms timeout — fast enough for the test, slow enough to let the
      // mock promise be observed as "still pending" before the timer fires.
      30,
      mockLogger,
    );

    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        { provide: SendReportByEmailUseCase, useValue: realUseCase },
        { provide: PdfService, useValue: {} },
        { provide: GeneratePdfUseCase, useValue: {} },
        { provide: ClientsListReportSpec, useValue: {} },
        { provide: PaymentsReportSpec, useValue: {} },
        { provide: ConnectionHistoryReportSpec, useValue: {} },
        { provide: AccountStatementReportSpec, useValue: {} },
        { provide: OverdueAccountsReportSpec, useValue: {} },
        { provide: OverdueAccountsReportSpec, useValue: {} },
        {
          provide: GetPaymentAgreementPdfDataUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: ReportStyleDispatcher, useValue: { dispatch: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();
    slowApp = moduleRef.createNestApplication();
    slowApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await slowApp.init();
  });

  afterAll(async () => {
    await slowApp?.close();
  });

  it('returns 503 with "PDF generation timeout" when ReportStyleDispatcher.dispatch hangs past the timeout', async () => {
    const res = await request(slowApp.getHttpServer())
      .post('/reports/payments-report/email')
      .send({ clienteId: '1' })
      .expect(503);

    expect(res.body).toMatchObject({
      message: expect.stringContaining('PDF generation timeout'),
      statusCode: 503,
    });
    expect(slowPdfDispatch).toHaveBeenCalledTimes(1);
  });
});

// --- end of merged spec ---
