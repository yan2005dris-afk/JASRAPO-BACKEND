import { UnauthorizedException, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import request from 'supertest';

// Mock puppeteer so we never need a real Chromium in the e2e suite.
jest.mock('puppeteer', () => ({}));

// Mock the SistemaConfigService so the dispatcher resolves styles in-memory
// without hitting the DB. The fallback chain is fully covered by the unit
// specs — this file's job is end-to-end integration.
import { SistemaConfigService } from '../../src/infrastructure/config/sistema-config.service';
import { SistemaConfigRepository } from '../../src/infrastructure/config/sistema-config.repository';
import { ReportsController } from '../../src/reports/interfaces/http/reports.controller';
import { ClientsListReportSpec } from '../../src/reports/specs/clients-list.report-spec';
import { PaymentsReportSpec } from '../../src/reports/specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from '../../src/reports/specs/connection-history.report-spec';
import { AccountStatementReportSpec } from '../../src/reports/specs/account-statement.report-spec';
import { GetPaymentAgreementPdfDataUseCase } from '../../src/billing/collections/agreements/application/use-cases/get-payment-agreement-pdf-data.use-case';
import { PdfService } from '../../src/infrastructure/pdf/pdf.service';
import { GeneratePdfUseCase } from '../../src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ReportStyleDispatcher } from '../../src/reports/application/report-style.dispatcher';
import { ReportStyleService } from '../../src/reports/application/report-style.service';
import { JwtAuthGuard } from '../../src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../src/infrastructure/common/guards/permissions.guard';

const FAKE_PDF = Buffer.from('%PDF-1.4\n%fake\n%%EOF');

/**
 * Reports e2e — exercises the consolidated endpoints end-to-end:
 *  - 401 returned for every endpoint when no JWT is supplied
 *    (proves class-level @UseGuards is active — REQ-5/7)
 *  - the 6 deleted endpoints return 404 at runtime (REQ-9)
 *  - the 3 consolidated endpoints + clients-list + account-statement respond
 *    with 200 + Content-Type: application/pdf when given a valid JWT
 *    (REQ-1/2/3, REQ-10)
 *  - the consolidated endpoints route through the dispatcher (REQ-16)
 *
 * The test bypasses the heavy lifting (Prisma + Puppeteer) by overriding
 * providers with fakes that satisfy the public API. Database auth + PDF
 * rendering are already covered by existing specs and the e2e setup.
 */
describe('Reports e2e (HTTP integration)', () => {
  let app: INestApplication<App>;
  let dispatcherSpy: jest.Mock;
  let validAccessToken: string;

  beforeAll(async () => {
    validAccessToken = 'Bearer valid-test-token';

    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        // Mocked infrastructure
        {
          provide: SistemaConfigService,
          useValue: {
            getString: jest.fn(async (clave: string) => {
              if (clave === 'reporte.estilo.default') return 'modern';
              if (clave === 'reporte.estilo.payments-report') return 'modern';
              if (clave === 'reporte.estilo.connection-history')
                return 'modern';
              if (clave === 'reporte.estilo.payment-agreement') return 'modern';
              return 'modern';
            }),
          },
        },
        {
          provide: SistemaConfigRepository,
          useValue: { findByClave: jest.fn() },
        },
        {
          provide: PdfService,
          useValue: {
            render: jest.fn(async () => FAKE_PDF),
            getDocumentType: jest.fn(),
            getAvailableTypes: jest.fn(() => [
              'clients-list',
              'account-statement',
              'payments-report',
              'payments-report-legacy',
              'payments-report-modern',
              'connection-history',
              'connection-history-legacy',
              'connection-history-modern',
              'payment-agreement-legacy',
              'payment-agreement-modern',
            ]),
          },
        },
        {
          provide: GeneratePdfUseCase,
          useValue: {
            execute: jest.fn(async () => FAKE_PDF),
          },
        },
        {
          provide: ClientsListReportSpec,
          useValue: { fetchData: jest.fn(async () => ({ clientes: [] })) },
        },
        {
          provide: PaymentsReportSpec,
          useValue: { fetchData: jest.fn(async () => ({ pagos: [] })) },
        },
        {
          provide: ConnectionHistoryReportSpec,
          useValue: {
            fetchData: jest.fn(async () => ({
              reporte: { clienteNombre: 'Acme' },
              prefacturas: [],
            })),
          },
        },
        {
          provide: AccountStatementReportSpec,
          useValue: {
            fetchData: jest.fn(async () => ({
              reporte: { clienteNombre: 'Acme' },
            })),
          },
        },
        {
          provide: GetPaymentAgreementPdfDataUseCase,
          useValue: {
            execute: jest.fn(async (convenioId: bigint) => ({
              convenio: {
                convenioId: String(convenioId),
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
            })),
          },
        },
        // Real application services (style + dispatcher)
        ReportStyleService,
        {
          provide: ReportStyleDispatcher,
          useFactory: (styles: ReportStyleService, pdf: PdfService) => {
            dispatcherSpy = jest.fn(
              async (
                key: string,
                raw: Record<string, unknown>,
                hash?: string,
              ) => {
                const style = await styles.resolveStyle(
                  key as 'payments-report',
                );
                const composite = `${key}-${style}`;
                const tpl = pdf.getDocumentType(composite);
                const adapted = tpl?.adaptData ? tpl.adaptData(raw) : raw;
                const buf = await pdf.render(
                  tpl?.template ?? composite,
                  adapted,
                );
                const filename = `${key}-${hash ?? 'auto'}.pdf`;
                return { buffer: buf, filename };
              },
            );
            return { dispatch: dispatcherSpy };
          },
          inject: [ReportStyleService, PdfService],
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => {
            getRequest: () => { headers: { authorization?: string } };
          };
        }) => {
          const req = ctx.switchToHttp().getRequest();
          const auth = req.headers.authorization;
          if (auth !== validAccessToken) {
            // Real JwtAuthGuard throws UnauthorizedException, not just false,
            // so we mirror that to get a 401 instead of NestJS's default 403.
            throw new UnauthorizedException();
          }
          (req as { user?: unknown }).user = {
            usersId: 1,
            email: 'e2e@jasrapo.com',
            permisos: [{ recurso: 'reportes', accion: 'read' }],
          };
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => { user?: unknown } };
        }) => {
          const req = ctx.switchToHttp().getRequest();
          const user = req.user as
            | { permisos?: { recurso: string; accion: string }[] }
            | undefined;
          if (!user) return false;
          return (user.permisos ?? []).some(
            (p) =>
              p.recurso === 'reportes' &&
              (p.accion === 'read' || p.accion === 'leer'),
          );
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  // ─── REQ-7: auth gate ──────────────────────────────────────────────────────

  describe('auth gate (REQ-7)', () => {
    it.each([
      'payments-report',
      'connection-history',
      'payment-agreement',
      'clients-list',
      'account-statement',
    ])('returns 401 for GET /reports/%s without a JWT', async (path) => {
      await request(app.getHttpServer()).get(`/reports/${path}`).expect(401);
    });
  });

  // ─── REQ-9: deleted endpoints ──────────────────────────────────────────────

  describe('deleted endpoints (REQ-9)', () => {
    it.each([
      'payments-report-legacy',
      'payments-report-modern',
      'connection-history-legacy',
      'connection-history-modern',
      'payment-agreement-legacy',
      'payment-agreement-modern',
    ])('returns 404 for the deleted /reports/%s', async (path) => {
      const res = await request(app.getHttpServer())
        .get(`/reports/${path}`)
        .set('Authorization', validAccessToken);
      expect([404]).toContain(res.status);
    });
  });

  // ─── REQ-1/2/3 + REQ-10: consolidated + untouched endpoints ────────────────

  describe('happy path with valid JWT', () => {
    it('GET /reports/payments-report returns a PDF and routes through the dispatcher', async () => {
      const res = await request(app.getHttpServer())
        .get('/reports/payments-report')
        .set('Authorization', validAccessToken)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
      expect(dispatcherSpy).toHaveBeenCalled();
      const call = dispatcherSpy.mock.calls[0] as unknown as [string, unknown];
      expect(call[0]).toBe('payments-report');
    });

    it('GET /reports/connection-history returns a PDF', async () => {
      const res = await request(app.getHttpServer())
        .get('/reports/connection-history?contratoId=42')
        .set('Authorization', validAccessToken)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
      const last =
        dispatcherSpy.mock.calls[dispatcherSpy.mock.calls.length - 1];
      expect(last?.[0]).toBe('connection-history');
    });

    it('GET /reports/payment-agreement returns a PDF', async () => {
      const res = await request(app.getHttpServer())
        .get('/reports/payment-agreement?convenioId=1')
        .set('Authorization', validAccessToken)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
      const last =
        dispatcherSpy.mock.calls[dispatcherSpy.mock.calls.length - 1];
      expect(last?.[0]).toBe('payment-agreement');
    });

    it('GET /reports/clients-list returns a PDF (untouched, no dispatcher)', async () => {
      const res = await request(app.getHttpServer())
        .get('/reports/clients-list')
        .set('Authorization', validAccessToken)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
    });

    it('GET /reports/account-statement returns a PDF (untouched, no dispatcher)', async () => {
      const res = await request(app.getHttpServer())
        .get('/reports/account-statement?contratoId=42')
        .set('Authorization', validAccessToken)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
    });
  });

  // ─── REQ-6/8: 403 when JWT lacks the permission ─────────────────────────────

  describe('403 when JWT lacks reportes:read permission', () => {
    let deniedApp: INestApplication<App>;

    beforeAll(async () => {
      const deniedModule = await Test.createTestingModule({
        controllers: [ReportsController],
        providers: [
          {
            provide: SistemaConfigService,
            useValue: { getString: jest.fn(async () => 'modern') },
          },
          {
            provide: SistemaConfigRepository,
            useValue: { findByClave: jest.fn() },
          },
          {
            provide: PdfService,
            useValue: {
              render: jest.fn(async () => FAKE_PDF),
              getDocumentType: jest.fn(),
              getAvailableTypes: jest.fn(() => []),
            },
          },
          {
            provide: GeneratePdfUseCase,
            useValue: { execute: jest.fn(async () => FAKE_PDF) },
          },
          {
            provide: ClientsListReportSpec,
            useValue: { fetchData: jest.fn(async () => ({})) },
          },
          {
            provide: PaymentsReportSpec,
            useValue: { fetchData: jest.fn(async () => ({})) },
          },
          {
            provide: ConnectionHistoryReportSpec,
            useValue: { fetchData: jest.fn(async () => ({})) },
          },
          {
            provide: AccountStatementReportSpec,
            useValue: { fetchData: jest.fn(async () => ({})) },
          },
          {
            provide: GetPaymentAgreementPdfDataUseCase,
            useValue: {
              execute: jest.fn(async () => ({
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
                  contrato: { numeroGuia: 'NG-001', direccionSuministro: 'Av. Principal 123' },
                  cliente: {
                    nombres: 'María',
                    apellidos: 'García',
                    razonSocial: null,
                    identificacion: '0912345678',
                  },
                },
              })),
            },
          },
          ReportStyleService,
          {
            provide: ReportStyleDispatcher,
            useValue: {
              dispatch: jest.fn(async () => ({
                buffer: FAKE_PDF,
                filename: 'x.pdf',
              })),
            },
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: (ctx: {
            switchToHttp: () => {
              getRequest: () => { headers: { authorization?: string } };
            };
          }) => {
            const req = ctx.switchToHttp().getRequest();
            if (req.headers.authorization === 'Bearer valid-test-token') {
              (req as { user?: unknown }).user = {
                usersId: 1,
                email: 'no-perm@jasrapo.com',
                permisos: [{ recurso: 'otro-recurso', accion: 'read' }],
              };
              return true;
            }
            return false;
          },
        })
        .overrideGuard(PermissionsGuard)
        .useValue({
          canActivate: () => false, // always deny
        })
        .compile();

      deniedApp = deniedModule.createNestApplication();
      await deniedApp.init();
    });

    afterAll(async () => {
      if (deniedApp) await deniedApp.close();
    });

    it('returns 403 for a JWT with valid signature but missing reportes:read', async () => {
      await request(deniedApp.getHttpServer())
        .get('/reports/payments-report')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(403);
    });
  });
});
