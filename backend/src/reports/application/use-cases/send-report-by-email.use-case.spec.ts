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
import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SendReportByEmailUseCase } from './send-report-by-email.use-case';
import type { MailService } from 'src/infrastructure/mail/application/mail.service';
import type { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import type { ReportEmailStrategy } from './send-report-by-email.strategy';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

// PR 4: PDF-generation timeout used by every test in this file. Production
// default is 30s but that would make the timeout test path take ~30s — we
// keep the same code path but speed up the test by passing a tiny value.
const TEST_PDF_TIMEOUT_MS = 50;

describe('SendReportByEmailUseCase (skeleton)', () => {
  // PR 1 builds the skeleton with a constructor-injectable strategies map.
  // Specs inject custom strategies so we can prove the execute() contract
  // without depending on the real implementations (those land in PR 2).
  const mockMailService = { sendReport: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };

  const buildStrategy = (
    overrides: Partial<ReportEmailStrategy<Record<string, unknown>>> = {},
  ): ReportEmailStrategy<Record<string, unknown>> => ({
    reportType: 'payments-report',
    recipientResolver: jest.fn().mockResolvedValue('client@example.com'),
    subjectBuilder: jest.fn().mockReturnValue('Reporte de Abonos — Cliente #1'),
    fetchSpec: jest.fn().mockResolvedValue({ pagos: [] }),
    ...overrides,
  });

  const compile = async (
    strategies: Record<string, ReportEmailStrategy<Record<string, unknown>>>,
    pdfTimeoutMs: number = TEST_PDF_TIMEOUT_MS,
  ): Promise<SendReportByEmailUseCase> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        {
          provide: SendReportByEmailUseCase,
          useFactory: () =>
            new SendReportByEmailUseCase(
              mockMailService as unknown as MailService,
              mockGeneratePdf as unknown as GeneratePdfUseCase,
              strategies,
              pdfTimeoutMs,
              mockLogger,
            ),
        },
      ],
    }).compile();
    return module.get(SendReportByEmailUseCase);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMailService.sendReport.mockResolvedValue({ jobId: 'job-abc' });
    mockGeneratePdf.execute.mockResolvedValue(Buffer.from('pdf-bytes'));
  });

  it('returns the queued envelope shape on success', async () => {
    const strategy = buildStrategy();
    const useCase = await compile({ 'payments-report': strategy });

    const result = await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
    });

    expect(result).toEqual({
      queued: true,
      jobId: 'job-abc',
      destinatario: 'client@example.com',
      subject: 'Reporte de Abonos — Cliente #1',
    });
  });

  it('resolves recipient via strategy.recipientResolver when no override is provided', async () => {
    const recipientResolver = jest
      .fn()
      .mockResolvedValue('derived@example.com');
    const useCase = await compile({
      'account-statement': buildStrategy({
        reportType: 'account-statement',
        recipientResolver,
        subjectBuilder: () => 'Estado de Cuenta — Contrato #5',
      }),
    });

    await useCase.execute({
      reportType: 'account-statement',
      filters: { contratoId: '5' },
    });

    expect(recipientResolver).toHaveBeenCalledWith(
      { contratoId: '5' },
      expect.any(Object),
    );
    expect(mockMailService.sendReport).toHaveBeenCalledWith(
      'derived@example.com',
      'Estado de Cuenta — Contrato #5',
      'account-statement',
      expect.any(Buffer),
    );
  });

  it('uses destinatarioOverride when provided and ignores derived recipient', async () => {
    const recipientResolver = jest
      .fn()
      .mockResolvedValue('derived@example.com');
    const useCase = await compile({
      'payments-report': buildStrategy({ recipientResolver }),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
      destinatarioOverride: 'override@example.com',
    });

    expect(mockMailService.sendReport).toHaveBeenCalledWith(
      'override@example.com',
      expect.any(String),
      'payments-report',
      expect.any(Buffer),
    );
  });

  // SUG #1: skip recipientResolver when destinatarioOverride is provided so
  // the resolver never hits the DB unnecessarily (matters in PR 2 with real
  // lookups).
  it('skips recipientResolver when destinatarioOverride is provided', async () => {
    const recipientResolver = jest.fn();
    const fetchSpec = jest.fn().mockResolvedValue({ pagos: [] });
    const subjectBuilder = jest.fn().mockReturnValue('Subject');
    const useCase = await compile({
      'payments-report': buildStrategy({
        recipientResolver,
        fetchSpec,
        subjectBuilder,
      }),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
      destinatarioOverride: 'override@example.com',
    });

    expect(recipientResolver).not.toHaveBeenCalled();
  });

  it('uses subjectOverride when provided and ignores default subject', async () => {
    const subjectBuilder = jest
      .fn()
      .mockReturnValue('Default Subject — Cliente #1');
    const useCase = await compile({
      'payments-report': buildStrategy({ subjectBuilder }),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
      subjectOverride: 'Custom subject',
    });

    expect(mockMailService.sendReport).toHaveBeenCalledWith(
      expect.any(String),
      'Custom subject',
      'payments-report',
      expect.any(Buffer),
    );
  });

  it('throws NotFoundException for unknown reportType', async () => {
    const useCase = await compile({});

    await expect(
      useCase.execute({ reportType: 'unknown', filters: {} }),
    ).rejects.toThrow(NotFoundException);

    expect(mockGeneratePdf.execute).not.toHaveBeenCalled();
    expect(mockMailService.sendReport).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when no recipient can be resolved', async () => {
    const recipientResolver = jest.fn().mockResolvedValue(null);
    const useCase = await compile({
      'clients-list': buildStrategy({
        reportType: 'clients-list',
        recipientResolver,
        subjectBuilder: () => 'Listado de Clientes',
      }),
    });

    await expect(
      useCase.execute({
        reportType: 'clients-list',
        filters: {},
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockGeneratePdf.execute).not.toHaveBeenCalled();
    expect(mockMailService.sendReport).not.toHaveBeenCalled();
  });

  it('propagates PDF generation errors and never queues mail', async () => {
    mockGeneratePdf.execute.mockRejectedValueOnce(new Error('puppeteer boom'));

    const strategy = buildStrategy();
    const useCase = await compile({ 'payments-report': strategy });

    await expect(
      useCase.execute({
        reportType: 'payments-report',
        filters: { clienteId: '1' },
      }),
    ).rejects.toThrow('puppeteer boom');

    expect(mockMailService.sendReport).not.toHaveBeenCalled();
  });

  it('surfaces MailService null jobId as a propagated error', async () => {
    mockMailService.sendReport.mockRejectedValueOnce(
      new Error('Mail queue rejected the job'),
    );

    const useCase = await compile({
      'payments-report': buildStrategy(),
    });

    await expect(
      useCase.execute({
        reportType: 'payments-report',
        filters: { clienteId: '1' },
      }),
    ).rejects.toThrow('Mail queue rejected the job');
  });

  // PR 2: the use case now calls strategy.fetchSpec(filters) and passes the
  // SPEC DATA (not the raw filters) to GeneratePdfUseCase.execute. The PDF
  // templates expect the spec output shape (e.g. `pagos`, `fechaDesde`).
  it('passes the spec data (not the raw filters) to GeneratePdfUseCase.execute', async () => {
    const fetchSpec = jest.fn().mockResolvedValue({
      pagos: [{ factura: 'F1', valorNum: 10 }],
      totalGeneral: '10.00',
      totalRegistros: 1,
    });
    const useCase = await compile({
      'payments-report': buildStrategy({ fetchSpec }),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '7' },
    });

    expect(fetchSpec).toHaveBeenCalledWith({ clienteId: '7' });
    expect(mockGeneratePdf.execute).toHaveBeenCalledWith('payments-report', {
      pagos: [{ factura: 'F1', valorNum: 10 }],
      totalGeneral: '10.00',
      totalRegistros: 1,
    });
  });

  // PR 2: per-strategy envelope shape — each route must resolve its derived
  // recipient and subject via its own strategy. Confirms the wiring is
  // dispatch-based on `reportType`.
  it.each([
    {
      reportType: 'payments-report',
      filters: { clienteId: '1' },
      recipient: 'p@example.com',
      subject: 'Reporte de Abonos — Cliente #1',
    },
    {
      reportType: 'connection-history',
      filters: { contratoId: '5' },
      recipient: 'c@example.com',
      subject: 'Historial de Conexión — Contrato #5',
    },
    {
      reportType: 'payment-agreement',
      filters: { convenioId: '9' },
      recipient: 'a@example.com',
      subject: 'Convenio de Pago #9',
    },
    {
      reportType: 'account-statement',
      filters: { contratoId: '12' },
      recipient: 's@example.com',
      subject: 'Estado de Cuenta — Contrato #12',
    },
  ] as const)(
    'returns the queued envelope for $reportType',
    async ({ reportType, filters, recipient, subject }) => {
      const useCase = await compile({
        [reportType]: buildStrategy({
          reportType,
          recipientResolver: jest.fn().mockResolvedValue(recipient),
          subjectBuilder: jest.fn().mockReturnValue(subject),
          fetchSpec: jest.fn().mockResolvedValue({ stub: true }),
        }),
      });

      const result = await useCase.execute({ reportType, filters });

      expect(result).toEqual({
        queued: true,
        jobId: 'job-abc',
        destinatario: recipient,
        subject,
      });
      expect(mockGeneratePdf.execute).toHaveBeenCalledWith(reportType, {
        stub: true,
      });
      expect(mockMailService.sendReport).toHaveBeenCalledWith(
        recipient,
        subject,
        reportType,
        expect.any(Buffer),
      );
    },
  );

  // clients-list has no derivable recipient — must 400 unless override is
  // supplied. Same shape as the prefactura 400.
  it('returns 400 for clients-list when no destinatarioOverride is given', async () => {
    const useCase = await compile({
      'clients-list': buildStrategy({
        reportType: 'clients-list',
        recipientResolver: jest.fn().mockResolvedValue(null),
        subjectBuilder: jest.fn().mockReturnValue('Listado de Clientes'),
        fetchSpec: jest.fn().mockResolvedValue({ clientes: [] }),
      }),
    });

    await expect(
      useCase.execute({ reportType: 'clients-list', filters: {} }),
    ).rejects.toThrow(BadRequestException);

    expect(mockGeneratePdf.execute).not.toHaveBeenCalled();
    expect(mockMailService.sendReport).not.toHaveBeenCalled();
  });

  // clients-list happy path WITH override — proves the resolver can stay
  // null even when override is given.
  it('accepts destinatarioOverride for clients-list', async () => {
    const recipientResolver = jest.fn().mockResolvedValue(null);
    const useCase = await compile({
      'clients-list': buildStrategy({
        reportType: 'clients-list',
        recipientResolver,
        subjectBuilder: jest.fn().mockReturnValue('Listado de Clientes'),
        fetchSpec: jest.fn().mockResolvedValue({ clientes: [] }),
      }),
    });

    const result = await useCase.execute({
      reportType: 'clients-list',
      filters: {},
      destinatarioOverride: 'ops@example.com',
    });

    expect(result.destinatario).toBe('ops@example.com');
    expect(recipientResolver).not.toHaveBeenCalled();
    expect(mockMailService.sendReport).toHaveBeenCalledWith(
      'ops@example.com',
      'Listado de Clientes',
      'clients-list',
      expect.any(Buffer),
    );
  });

  // SUG #2: the placeholder log message must reflect real values now that
  // we have a real jobId + destinatario in scope.
  it('logs a meaningful message that includes the actual jobId', async () => {
    const logSpy = jest
      .spyOn(mockLogger, 'log')
      .mockImplementation(() => undefined);

    const useCase = await compile({
      'payments-report': buildStrategy(),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/payments-report/),
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('job-abc'));

    logSpy.mockRestore();
  });

  // account-statement resolver may need the specData argument to skip an
  // extra DB query. Forward it through.
  it('forwards specData to account-statement recipientResolver', async () => {
    const recipientResolver = jest
      .fn()
      .mockResolvedValue('derived@example.com');
    const fetchSpec = jest.fn().mockResolvedValue({
      contrato: { cliente: { email: 'derived@example.com' } },
    });
    const useCase = await compile({
      'account-statement': buildStrategy({
        reportType: 'account-statement',
        recipientResolver,
        fetchSpec,
      }),
    });

    await useCase.execute({
      reportType: 'account-statement',
      filters: { contratoId: '12' },
    });

    expect(fetchSpec).toHaveBeenCalled();
    // Resolver was invoked with (filters, specData).
    expect(recipientResolver).toHaveBeenCalledWith(
      { contratoId: '12' },
      expect.objectContaining({
        contrato: { cliente: { email: 'derived@example.com' } },
      }),
    );
  });

  // ---------------------------------------------------------------------
  // PR 4 — PDF generation timeout + PII-safe logging
  // ---------------------------------------------------------------------

  it('throws ServiceUnavailableException when PDF generation exceeds the timeout', async () => {
    // Simulate a hung PDF renderer. The promise never resolves; the use
    // case's `withTimeout` wrapper must convert the TimeoutError into a
    // 503-mapped ServiceUnavailableException for the controller.
    mockGeneratePdf.execute.mockImplementation(
      () => new Promise<Buffer>(() => undefined),
    );

    const useCase = await compile({
      'payments-report': buildStrategy(),
    });

    await expect(
      useCase.execute({
        reportType: 'payments-report',
        filters: { clienteId: '1' },
      }),
    ).rejects.toThrow(ServiceUnavailableException);

    expect(mockMailService.sendReport).not.toHaveBeenCalled();
  });

  it('exposes the PDF timeout error message as "PDF generation timeout"', async () => {
    mockGeneratePdf.execute.mockImplementation(
      () => new Promise<Buffer>(() => undefined),
    );

    const useCase = await compile({
      'payments-report': buildStrategy(),
    });

    await expect(
      useCase.execute({
        reportType: 'payments-report',
        filters: { clienteId: '1' },
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('PDF generation timeout'),
    });
  });

  it('does NOT log the resolved recipient email at INFO level', async () => {
    // PII surface: the use case is per-HTTP-request, so the email is PII.
    // Per design rev 2 (decision #6 / item PII-LOW) the recipient must
    // never appear in INFO logs; only DEBUG carries it.
    const logSpy = jest
      .spyOn(mockLogger, 'log')
      .mockImplementation(() => undefined);

    const useCase = await compile({
      'payments-report': buildStrategy({
        recipientResolver: jest.fn().mockResolvedValue('pii@example.com'),
      }),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
    });

    for (const call of logSpy.mock.calls) {
      const args = call as unknown as unknown[];
      const joined = args
        .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ');
      expect(joined).not.toContain('pii@example.com');
    }

    logSpy.mockRestore();
  });

  it('does NOT log the override recipient email at INFO level', async () => {
    const logSpy = jest
      .spyOn(mockLogger, 'log')
      .mockImplementation(() => undefined);

    const useCase = await compile({
      'payments-report': buildStrategy(),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
      destinatarioOverride: 'override-pii@example.com',
    });

    for (const call of logSpy.mock.calls) {
      const args = call as unknown as unknown[];
      const joined = args
        .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ');
      expect(joined).not.toContain('override-pii@example.com');
    }

    logSpy.mockRestore();
  });

  it('emits a debug-level log after the recipient is resolved', async () => {
    const debugSpy = jest
      .spyOn(mockLogger, 'debug')
      .mockImplementation(() => undefined);

    const useCase = await compile({
      'payments-report': buildStrategy({
        recipientResolver: jest.fn().mockResolvedValue('derived@example.com'),
      }),
    });

    await useCase.execute({
      reportType: 'payments-report',
      filters: { clienteId: '1' },
    });

    expect(debugSpy).toHaveBeenCalled();
    const matched = debugSpy.mock.calls.some((call) => {
      const args = call as unknown as unknown[];
      const joined = args
        .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ');
      return (
        joined.includes('recipient resolved') &&
        joined.includes('payments-report')
      );
    });
    expect(matched).toBe(true);

    debugSpy.mockRestore();
  });
});
