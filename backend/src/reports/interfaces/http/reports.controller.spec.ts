jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { UseGuards, applyDecorators } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { ReportsController } from './reports.controller';
import { PdfService } from '../../../infrastructure/pdf/pdf.service';
import { GeneratePdfUseCase } from '../../../infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ClientsListReportSpec } from '../../specs/clients-list.report-spec';
import { PaymentsReportSpec } from '../../specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from '../../specs/connection-history.report-spec';
import { AccountStatementReportSpec } from '../../specs/account-statement.report-spec';
import { GetPaymentAgreementPdfDataUseCase } from '../../../billing/collections/agreements/application/use-cases/get-payment-agreement-pdf-data.use-case';
import { ReportStyleDispatcher } from '../../application/report-style.dispatcher';
import { ReportStyleService } from '../../application/report-style.service';
import { JwtAuthGuard } from '../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from '../../../infrastructure/common/decorators/require-permission.decorator';

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
  it('exposes exactly 5 @Get handlers (3 consolidated + clients-list + account-statement)', () => {
    // Walk the prototype chain to enumerate `@Get` route paths.
    const paths = collectGetPaths(ReportsController.prototype);
    expect(paths).toHaveLength(5);
    expect(paths.map((p) => p.toLowerCase())).toEqual(
      expect.arrayContaining([
        'payments-report',
        'connection-history',
        'payment-agreement',
        'clients-list',
        'account-statement',
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

  const mockRes = () => {
    // Minimal Express response surface — only what the controller uses.
    const res = {
      set: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
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

  it('paymentsReportPdf: calls PaymentsReportSpec then dispatcher, then writes the PDF', async () => {
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
        'Content-Type': 'application/pdf',
        'Content-Disposition': expect.stringContaining('payments-report'),
      }),
    );
    expect(res.end).toHaveBeenCalledWith(FAKE_PDF);
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

  it('clientsListPdf: does NOT route through the dispatcher (untouched)', async () => {
    clientsSpec.fetchData.mockResolvedValue({ clientes: [] });
    generatePdf.execute.mockResolvedValue(FAKE_PDF);
    const res = mockRes();

    await controller.clientsListPdf({}, res);

    expect(clientsSpec.fetchData).toHaveBeenCalledWith({});
    expect(generatePdf.execute).toHaveBeenCalledWith(
      'clients-list',
      expect.objectContaining({ clientes: [] }),
    );
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('accountStatementPdf: does NOT route through the dispatcher (untouched)', async () => {
    accountSpec.fetchData.mockResolvedValue({
      reporte: { clienteNombre: 'Acme' },
    });
    generatePdf.execute.mockResolvedValue(FAKE_PDF);
    const res = mockRes();

    await controller.accountStatementPdf({ contratoId: '42' }, res);

    expect(accountSpec.fetchData).toHaveBeenCalledWith({
      contratoId: '42',
    });
    expect(generatePdf.execute).toHaveBeenCalledWith(
      'account-statement',
      expect.objectContaining({ reporte: expect.any(Object) }),
    );
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
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
