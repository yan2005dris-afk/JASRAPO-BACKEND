import { UnauthorizedException } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import request from 'supertest';

jest.mock('puppeteer', () => ({}));
jest.mock('pg-boss', () => ({
  PgBoss: jest.fn(),
}));
import { AccountStatementReportDefinition } from '../../src/reports/application/definitions/account-statement-report.definition';
import { ClientsListReportDefinition } from '../../src/reports/application/definitions/clients-list-report.definition';
import { ConnectionHistoryReportDefinition } from '../../src/reports/application/definitions/connection-history-report.definition';
import { OverdueAccountsReportDefinition } from '../../src/reports/application/definitions/overdue-accounts-report.definition';
import { PaymentAgreementReportDefinition } from '../../src/reports/application/definitions/payment-agreement-report.definition';
import { PaymentsReportDefinition } from '../../src/reports/application/definitions/payments-report.definition';
import { ReportStyleDispatcher } from '../../src/reports/application/report-style.dispatcher';
import { SendReportByEmailUseCase } from '../../src/reports/application/use-cases/send-report-by-email.use-case';
import { ReportsController } from '../../src/reports/interfaces/http/reports.controller';
import { JwtAuthGuard } from '../../src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../src/infrastructure/common/guards/permissions.guard';
import { LoggerService } from '../../src/infrastructure/observability/logger/logger.service';

const FAKE_PDF = Buffer.from('%PDF-1.4\n%fake\n%%EOF');
const VALID_TOKEN = 'Bearer valid-test-token';
const document = {
  reporte: {
    titulo: 'Listado de Clientes',
    fecha: '20 de mayo de 2024',
    filtrosAplicados: '',
    totalClientes: 0,
    clientes: [],
  },
};

describe('Reports e2e (HTTP integration)', () => {
  let app: INestApplication<App>;
  const dispatcher = jest.fn(async (key: string) => ({
    buffer: FAKE_PDF,
    filename: `${key}.pdf`,
  }));

  beforeAll(async () => {
    const projection = { document, recipientEmail: null };
    const definition = () => ({
      generate: jest.fn().mockResolvedValue(projection),
    });
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ClientsListReportDefinition, useValue: definition() },
        { provide: PaymentsReportDefinition, useValue: definition() },
        { provide: ConnectionHistoryReportDefinition, useValue: definition() },
        { provide: AccountStatementReportDefinition, useValue: definition() },
        { provide: PaymentAgreementReportDefinition, useValue: definition() },
        {
          provide: OverdueAccountsReportDefinition,
          useValue: {
            generate: jest.fn().mockResolvedValue({
              document: { data: [], meta: { total: 0 }, kpis: {} },
              recipientEmail: null,
            }),
          },
        },
        {
          provide: ReportStyleDispatcher,
          useValue: { dispatch: dispatcher },
        },
        {
          provide: SendReportByEmailUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: LoggerService, useValue: { log: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => {
            getRequest: () => { headers: { authorization?: string } };
          };
        }) => {
          const req = context.switchToHttp().getRequest();
          if (req.headers.authorization !== VALID_TOKEN) {
            throw new UnauthorizedException();
          }
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => app.close());

  it.each([
    'payments-report',
    'connection-history?contratoId=42',
    'payment-agreement?convenioId=1',
    'clients-list',
    'account-statement?contratoId=42',
  ])('protege GET /reports/%s con JWT', async (route) => {
    await request(app.getHttpServer()).get(`/reports/${route}`).expect(401);
  });

  it.each([
    'payments-report-legacy',
    'payments-report-modern',
    'connection-history-legacy',
    'connection-history-modern',
    'payment-agreement-legacy',
    'payment-agreement-modern',
  ])('mantiene eliminado GET /reports/%s', async (route) => {
    await request(app.getHttpServer())
      .get(`/reports/${route}`)
      .set('Authorization', VALID_TOKEN)
      .expect(404);
  });

  it.each([
    ['payments-report', 'payments-report'],
    ['connection-history?contratoId=42', 'connection-history'],
    ['payment-agreement?convenioId=1', 'payment-agreement'],
    ['clients-list', 'clients-list'],
    ['account-statement?contratoId=42', 'account-statement'],
  ])('genera el PDF tipado de /reports/%s', async (route, reportKey) => {
    const result = await request(app.getHttpServer())
      .get(`/reports/${route}`)
      .set('Authorization', VALID_TOKEN)
      .set('Accept', 'application/pdf')
      .expect(200);

    expect(result.headers['content-type']).toContain('application/pdf');
    expect(dispatcher).toHaveBeenCalledWith(reportKey, document);
  });
});
