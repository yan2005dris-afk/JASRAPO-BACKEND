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
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SendReportByEmailUseCase } from './send-report-by-email.use-case';
import type { MailService } from 'src/infrastructure/mail/application/mail.service';
import type { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import type { ReportEmailStrategy } from './send-report-by-email.strategy';

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
    ...overrides,
  });

  const compile = async (
    strategies: Record<string, ReportEmailStrategy<Record<string, unknown>>>,
  ): Promise<SendReportByEmailUseCase> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SendReportByEmailUseCase,
          useFactory: () =>
            new SendReportByEmailUseCase(
              mockMailService as unknown as MailService,
              mockGeneratePdf as unknown as GeneratePdfUseCase,
              strategies,
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

    expect(recipientResolver).toHaveBeenCalledWith({ contratoId: '5' });
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

    expect(recipientResolver).toHaveBeenCalledTimes(1);
    expect(mockMailService.sendReport).toHaveBeenCalledWith(
      'override@example.com',
      expect.any(String),
      'payments-report',
      expect.any(Buffer),
    );
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
});
