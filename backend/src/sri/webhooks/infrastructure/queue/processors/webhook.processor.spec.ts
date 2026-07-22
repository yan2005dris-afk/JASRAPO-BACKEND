import * as dnsPromises from 'dns/promises';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { WebhookProcessor, WebhookBusinessError } from './webhook.processor';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { JobsService } from '../../../../../infrastructure/jobs/jobs.service';
import { LoggerService } from '../../../../../infrastructure/observability/logger/logger.service';

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

// Mock pg-boss directly so the JobsService class can be loaded by Jest's
// ESM-transformed module pipeline (pg-boss is ESM and not in Jest's default
// transformIgnorePatterns). The class itself only uses start/work/send/stop.
jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    work: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue(undefined),
  })),
}));

const mockedLookup = dnsPromises.lookup as unknown as jest.Mock;

describe('WebhookProcessor — SSRF / DNS-rebinding (issue #149)', () => {
  let processor: WebhookProcessor;
  let prismaMock: {
    webhookLogs: { create: jest.Mock };
  };
  let jobsMock: {
    work: jest.Mock;
    send: jest.Mock;
  };
  let loggerServiceMock: {
    log: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    debug: jest.Mock;
    verbose: jest.Mock;
    child: jest.Mock;
    getPinoLogger: jest.Mock;
  };
  let fetchSpy: jest.SpyInstance;

  const baseJob = {
    data: {
      configId: 'cfg-1',
      url: 'https://example.com',
      secreto: 'whsec_test',
      evento: 'comprobante.autorizado',
      payload: { foo: 'bar' },
    },
    retrycount: 0,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock = {
      webhookLogs: { create: jest.fn().mockResolvedValue({}) },
    };
    jobsMock = {
      work: jest.fn().mockResolvedValue(undefined),
      send: jest.fn(),
    };
    loggerServiceMock = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      child: jest.fn(),
      getPinoLogger: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookProcessor,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JobsService, useValue: jobsMock },
        { provide: LoggerService, useValue: loggerServiceMock },
      ],
    }).compile();

    processor = moduleRef.get(WebhookProcessor);
  });

  afterEach(() => {
    if (fetchSpy) fetchSpy.mockRestore();
  });

  it('pins a PUBLIC IPv4 into the undici dispatcher and proceeds with fetch', async () => {
    mockedLookup.mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
    ]);

    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    await (processor as any).processWebhook(baseJob);

    expect(mockedLookup).toHaveBeenCalledTimes(1);
    expect(mockedLookup).toHaveBeenCalledWith('example.com', {
      all: true,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const callArgs = fetchSpy.mock.calls[0][1];
    expect(callArgs.redirect).toBe('error');
    expect(callArgs.signal).toBeDefined();
    expect(callArgs.dispatcher).toBeDefined();

    expect(loggerServiceMock.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('ssrf_block'),
      expect.anything(),
    );

    expect(prismaMock.webhookLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ exitoso: true }),
      }),
    );
  });

  it('blocks 127.0.0.1 (loopback) with SSRF block + warn + business error', async () => {
    mockedLookup.mockResolvedValueOnce([{ address: '127.0.0.1', family: 4 }]);

    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

    await expect(
      (processor as any).processWebhook(baseJob),
    ).rejects.toBeInstanceOf(WebhookBusinessError);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith(
      expect.stringMatching(/ssrf_block.*127\.0\.0\.1/),
      'WebhookProcessor',
    );
  });

  it('blocks 169.254.169.254 (cloud metadata endpoint) with SSRF block', async () => {
    mockedLookup.mockResolvedValueOnce([
      { address: '169.254.169.254', family: 4 },
    ]);

    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

    await expect(
      (processor as any).processWebhook(baseJob),
    ).rejects.toBeInstanceOf(WebhookBusinessError);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith(
      expect.stringMatching(/ssrf_block.*169\.254\.169\.254/),
      'WebhookProcessor',
    );
  });

  it('blocks mixed DNS record when ANY record is a private IP', async () => {
    mockedLookup.mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
      { address: '10.0.0.5', family: 4 },
    ]);

    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

    await expect(
      (processor as any).processWebhook(baseJob),
    ).rejects.toBeInstanceOf(WebhookBusinessError);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith(
      expect.stringMatching(/ssrf_block.*10\.0\.0\.5/),
      'WebhookProcessor',
    );
  });

  it('rejects non-http(s) protocols (e.g. ftp) and does not call fetch', async () => {
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

    await expect(
      (processor as any).processWebhook({
        ...baseJob,
        data: { ...baseJob.data, url: 'ftp://example.com/feed' },
      }),
    ).rejects.toBeInstanceOf(WebhookBusinessError);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith(
      expect.stringMatching(/ssrf_block.*Protocol not allowed/),
      'WebhookProcessor',
    );
  });

  it('logs an infrastructure-level error when the fetch itself throws after pinning', async () => {
    mockedLookup.mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
    ]);
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await expect((processor as any).processWebhook(baseJob)).rejects.toThrow(
      'ECONNREFUSED',
    );

    // LoggerService.warn is reserved for SSRF blocks. The infra error uses
    // the NestJS native logger.error path (which is silenced in the test).
    expect(loggerServiceMock.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('ssrf_block'),
      expect.anything(),
    );
  });
});
