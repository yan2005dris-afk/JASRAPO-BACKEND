import { BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';
import { ReportRequestContextFactory } from '../../application/report-request-context.factory';
import { ReportRequestContextException } from '../../application/report-request-context.exception';
import { ReportsController } from './reports.controller';

function response(accept = '') {
  const req = {
    headers: { accept },
    once: jest.fn(),
    removeListener: jest.fn(),
  };
  return {
    req,
    set: jest.fn(),
    send: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    writableEnded: false,
  } as unknown as Response;
}

const actor: JwtPayload = {
  sub: 7,
  usersId: 7,
  sid: 'session-7',
  email: 'operator@example.com',
  rol: 'operador',
  permisos: [{ recurso: 'reportes', accion: 'read' }],
};
const timeZone = 'America/Guayaquil';
const locale = 'es-EC';

describe('ReportsController', () => {
  const document = {
    reporte: {
      titulo: 'Listado de Clientes',
      fecha: '20 de mayo de 2024',
      filtrosAplicados: '',
      totalClientes: 0,
      clientes: [],
    },
  };
  const projection = { document, recipientEmail: null };
  const clients = { generate: jest.fn().mockResolvedValue(projection) };
  const payments = { generate: jest.fn().mockResolvedValue(projection) };
  const connection = { generate: jest.fn().mockResolvedValue(projection) };
  const account = { generate: jest.fn().mockResolvedValue(projection) };
  const overdue = {
    generate: jest.fn().mockResolvedValue({
      document: { data: [], meta: { total: 0 }, kpis: {} },
      recipientEmail: null,
    }),
  };
  const agreement = { generate: jest.fn().mockResolvedValue(projection) };
  const zoneConsumption = {
    generate: jest.fn().mockResolvedValue({
      document: { data: [], meta: { total: 0 }, kpis: {} },
      recipientEmail: null,
    }),
  };
  const contextFactory = new ReportRequestContextFactory();
  const dispatcher = {
    dispatch: jest.fn().mockResolvedValue({
      buffer: Buffer.from('pdf'),
      filename: 'report.pdf',
    }),
  };
  const sendEmail = { execute: jest.fn().mockResolvedValue({ queued: true }) };
  const logger = { log: jest.fn() };
  const exportStreamService = {
    createExportStream: jest.fn().mockReturnValue({
      stream: { pipe: jest.fn(), on: jest.fn() },
      contentType: 'text/csv; charset=utf-8',
      filename: 'report.csv',
    }),
  };
  const controller = new ReportsController(
    clients as never,
    payments as never,
    connection as never,
    account as never,
    overdue as never,
    agreement as never,
    zoneConsumption as never,
    contextFactory,
    dispatcher as never,
    exportStreamService as never,
    sendEmail as never,
    logger as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('streams CSV when format=csv is requested via query or header', async () => {
    const res = response('text/csv');
    (res.req as any).query = { format: 'csv' };

    await controller.clientsListPdf({}, actor, timeZone, locale, res);

    expect(clients.generate).toHaveBeenCalled();
    expect(exportStreamService.createExportStream).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'csv',
      }),
    );
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'text/csv; charset=utf-8',
      }),
    );
  });

  it('jsonAcceptDoesNotInvokePdfRenderer', async () => {
    const res = response('application/json');

    await controller.paymentsReportPdf({}, actor, timeZone, locale, res);

    expect(payments.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        reportType: 'payments-report',
        actor: expect.objectContaining({ userId: 7 }),
        filters: {},
      }),
    );
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(JSON.stringify(document));
  });

  it('jsonResponseNeverInvokesPdfRenderer', async () => {
    for (const accept of ['application/json', 'application/json, */*', '*/*']) {
      await controller.clientsListPdf(
        {},
        actor,
        timeZone,
        locale,
        response(accept),
      );
    }

    expect(dispatcher.dispatch).not.toHaveBeenCalled();
    expect(clients.generate).toHaveBeenCalledTimes(3);
  });

  it('entrega el PDF cuando Accept solicita únicamente application/pdf', async () => {
    const res = response('application/pdf');

    await controller.clientsListPdf({}, actor, timeZone, locale, res);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'clients-list',
      document,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(res.end).toHaveBeenCalledWith(Buffer.from('pdf'));
    expect(res.send).not.toHaveBeenCalled();
  });

  it('genera el convenio mediante su definición canónica', async () => {
    const res = response('application/pdf');

    await controller.paymentAgreementPdf(
      { convenioId: '7' },
      actor,
      timeZone,
      locale,
      res,
    );

    expect(agreement.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        reportType: 'payment-agreement',
        filters: { convenioId: '7' },
      }),
    );
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'payment-agreement',
      document,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('negocia JSON o PDF para el reporte de morosidad', async () => {
    const overdueDocument = { data: [], meta: { total: 0 }, kpis: {} };

    const jsonRes = response('application/json');
    await controller.overdueAccounts({}, actor, timeZone, locale, jsonRes);
    expect(overdue.generate).toHaveBeenCalledWith(
      expect.objectContaining({ reportType: 'overdue-accounts' }),
    );
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
    expect(jsonRes.send).toHaveBeenCalledWith(JSON.stringify(overdueDocument));

    const pdfRes = response('application/pdf');
    await controller.overdueAccounts({}, actor, timeZone, locale, pdfRes);
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'overdue-accounts',
      overdueDocument,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(pdfRes.end).toHaveBeenCalledWith(Buffer.from('pdf'));
  });

  it('exige destinatario en el correo de morosidad', () => {
    expect(() =>
      controller.sendOverdueAccountsEmail({}, actor, timeZone, locale),
    ).toThrow(BadRequestException);
  });

  it('valida el identificador antes de enviar un reporte por correo', () => {
    expect(() =>
      controller.sendPaymentsReportEmail({}, actor, timeZone, locale),
    ).toThrow(BadRequestException);
  });

  it('delega el envío de correo con contexto normalizado', () => {
    void controller.sendConnectionHistoryEmail(
      {
        contratoId: '12',
        destinatario: 'ana@example.com',
      },
      actor,
      timeZone,
      locale,
    );

    expect(sendEmail.execute).toHaveBeenCalledWith({
      context: expect.objectContaining({
        reportType: 'connection-history',
        filters: { contratoId: '12' },
        timeZone,
        locale,
      }),
      destinatarioOverride: 'ana@example.com',
      subjectOverride: undefined,
      idempotencyKey: undefined,
    });
  });

  it('reportRequestContextIsIdenticalAcrossJsonPdfAndEmail', async () => {
    const sharedFilters = {
      clienteId: '25',
      fechaDesde: '2026-08-01',
      fechaHasta: '2026-08-24',
    };

    await controller.paymentsReportPdf(
      sharedFilters,
      actor,
      timeZone,
      locale,
      response('application/json'),
    );
    await controller.paymentsReportPdf(
      sharedFilters,
      actor,
      timeZone,
      locale,
      response('application/pdf'),
    );
    await controller.sendPaymentsReportEmail(
      sharedFilters,
      actor,
      timeZone,
      locale,
    );

    const jsonContext = payments.generate.mock.calls[0]?.[0];
    const pdfContext = payments.generate.mock.calls[1]?.[0];
    const emailContext = sendEmail.execute.mock.calls[0]?.[0]?.context;

    expect(pdfContext).toEqual(jsonContext);
    expect(emailContext).toEqual(jsonContext);
  });

  it('conserva el contexto normalizado cuando falla la proyección', async () => {
    payments.generate.mockRejectedValueOnce(
      new BadRequestException('invalid report filters'),
    );

    let caught: unknown;
    try {
      await controller.paymentsReportPdf(
        { clienteId: '25', fechaDesde: '2026-08-01' },
        actor,
        timeZone,
        locale,
        response('application/json'),
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ReportRequestContextException);
    expect((caught as ReportRequestContextException).getResponse()).toEqual(
      expect.objectContaining({
        reportContext: expect.objectContaining({
          reportType: 'payments-report',
          actorId: 7,
          filters: { clienteId: '25', fechaDesde: '2026-08-01' },
        }),
      }),
    );
  });
});
