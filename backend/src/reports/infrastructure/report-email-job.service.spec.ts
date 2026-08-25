import type { JobsService } from 'src/infrastructure/jobs/jobs.service';
import type { MailService } from 'src/infrastructure/mail/application/mail.service';
import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { PdfAttachmentTooLargeException } from 'src/infrastructure/pdf/pdf.exceptions';
import type { ReportDocument } from '../application/models/report-projection';
import type { ReportStyleDispatcher } from '../application/report-style.dispatcher';
import { ReportEmailJobService } from './report-email-job.service';

describe('ReportEmailJobService', () => {
  const jobsService = {
    send: jest.fn(),
    work: jest.fn(),
  };
  const dispatcher = { dispatch: jest.fn() };
  const mailService = { sendReport: jest.fn() };
  const logger = { log: jest.fn() };
  const document: ReportDocument = {
    reporte: {
      titulo: 'Listado de Clientes',
      fecha: '',
      filtrosAplicados: '',
      totalClientes: 0,
      clientes: [],
    },
    institucion: {} as never,
    metadatosDocumento: {} as never,
  };

  const buildService = () =>
    new ReportEmailJobService(
      jobsService as unknown as JobsService,
      dispatcher as unknown as ReportStyleDispatcher,
      mailService as unknown as MailService,
      logger as unknown as LoggerService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    process.env['PDF_EMAIL_MAX_ATTACHMENT_BYTES'] = '8';
    jobsService.send.mockResolvedValue('job-1');
    dispatcher.dispatch.mockResolvedValue({ buffer: Buffer.from('pdf') });
    mailService.sendReport.mockResolvedValue({ jobId: 'mail-job-1' });
  });

  afterEach(() => {
    delete process.env['PDF_EMAIL_MAX_ATTACHMENT_BYTES'];
  });

  it('pdfEmailJobIsIdempotentAndHonorsAttachmentLimit', async () => {
    const service = buildService();
    const payload = {
      reportType: 'payments-report' as const,
      document,
      destinatario: 'client@example.com',
      subject: 'Reporte',
      idempotencyKey: '4b35520c-b4ae-41af-a136-a53ba5a8fd94',
    };

    const first = await service.enqueue(payload);
    jobsService.send.mockResolvedValueOnce(null);
    const duplicate = await service.enqueue(payload);

    expect(first).toEqual({ jobId: 'job-1', deduplicated: false });
    expect(duplicate).toEqual({
      jobId: 'report-email:4b35520c-b4ae-41af-a136-a53ba5a8fd94',
      deduplicated: true,
    });
    expect(jobsService.send).toHaveBeenLastCalledWith(
      'generate-report-email',
      expect.objectContaining({
        idempotencyKey: '4b35520c-b4ae-41af-a136-a53ba5a8fd94',
      }),
      expect.objectContaining({
        singletonKey: 'report-email:4b35520c-b4ae-41af-a136-a53ba5a8fd94',
      }),
    );

    dispatcher.dispatch.mockResolvedValueOnce({ buffer: Buffer.alloc(9) });
    await expect(service.processJob(payload)).rejects.toThrow(
      PdfAttachmentTooLargeException,
    );
    expect(mailService.sendReport).not.toHaveBeenCalled();
  });

  it('generates the attachment inside the worker before queueing delivery', async () => {
    const service = buildService();
    const payload = {
      reportType: 'payments-report' as const,
      document,
      destinatario: 'client@example.com',
      subject: 'Reporte',
      idempotencyKey: '4b35520c-b4ae-41af-a136-a53ba5a8fd94',
    };

    await service.processJob(payload);

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'payments-report',
      document,
    );
    expect(mailService.sendReport).toHaveBeenCalledWith(
      payload.destinatario,
      payload.subject,
      payload.reportType,
      Buffer.from('pdf'),
      expect.objectContaining({
        idempotencyKey: payload.idempotencyKey,
        maxAttachmentBytes: 8,
      }),
    );
  });
});
