/**
 * PR 3 — supertest integration tests for the 5 `POST /reports/.../email`
 * routes. Exercises route registration, body parsing, ValidationPipe,
 * guards, controller, and JSON serialization against a real Nest app.
 */
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

import type { INestApplication } from '@nestjs/common';
import { ForbiddenException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ReportsController } from './reports.controller';
import { SendReportByEmailUseCase } from '../../application/use-cases/send-report-by-email.use-case';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ClientsListReportSpec } from '../../specs/clients-list.report-spec';
import { PaymentsReportSpec } from '../../specs/payments-report.report-spec';
import { ConnectionHistoryReportSpec } from '../../specs/connection-history.report-spec';
import { AccountStatementReportSpec } from '../../specs/account-statement.report-spec';

const ENVELOPE = {
  queued: true,
  jobId: 'job-abc',
  destinatario: 'client@example.com',
  subject: 'Reporte de Abonos — Cliente #1',
};

// null `missingRequiredField` skips the "required id missing" test (clients-list
// has no id; its required `destinatario` is covered separately below).
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
