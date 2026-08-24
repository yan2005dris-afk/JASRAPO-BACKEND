import { BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
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
    once: jest.fn(),
    removeListener: jest.fn(),
    writableEnded: false,
  } as unknown as Response;
}

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
  const dispatcher = {
    dispatch: jest.fn().mockResolvedValue({
      buffer: Buffer.from('pdf'),
      filename: 'report.pdf',
    }),
  };
  const sendEmail = { execute: jest.fn().mockResolvedValue({ queued: true }) };
  const logger = { log: jest.fn() };
  const controller = new ReportsController(
    clients as never,
    payments as never,
    connection as never,
    account as never,
    overdue as never,
    agreement as never,
    dispatcher as never,
    sendEmail as never,
    logger as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('usa la definición compartida para JSON y PDF', async () => {
    const res = response();

    await controller.paymentsReportPdf({}, res);

    expect(payments.generate).toHaveBeenCalledWith({});
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'payments-report',
      document,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(res.send).toHaveBeenCalledWith(JSON.stringify(document));
  });

  it('entrega el PDF cuando Accept solicita únicamente application/pdf', async () => {
    const res = response('application/pdf');

    await controller.clientsListPdf({}, res);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'clients-list',
      document,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(res.end).toHaveBeenCalledWith(Buffer.from('pdf'));
    expect(res.send).not.toHaveBeenCalled();
  });

  it('genera el convenio mediante su definición canónica', async () => {
    const res = response();

    await controller.paymentAgreementPdf({ convenioId: '7' }, res);

    expect(agreement.generate).toHaveBeenCalledWith({ convenioId: '7' });
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'payment-agreement',
      document,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('devuelve la proyección tipada de morosidad', async () => {
    await expect(controller.overdueAccounts({})).resolves.toEqual({
      data: [],
      meta: { total: 0 },
      kpis: {},
    });
  });

  it('valida el identificador antes de enviar un reporte por correo', () => {
    expect(() => controller.sendPaymentsReportEmail({})).toThrow(
      BadRequestException,
    );
  });

  it('delega el envío de correo con filtros tipados', () => {
    void controller.sendConnectionHistoryEmail({
      contratoId: '12',
      destinatario: 'ana@example.com',
    });

    expect(sendEmail.execute).toHaveBeenCalledWith({
      reportType: 'connection-history',
      filters: { contratoId: '12' },
      destinatarioOverride: 'ana@example.com',
      subjectOverride: undefined,
      idempotencyKey: undefined,
    });
  });
});
