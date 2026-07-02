import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ReportStyleService } from './report-style.service';
import { SistemaConfigService } from '../../../infrastructure/config/sistema-config.service';
import {
  REPORTE_ESTILO_DEFAULT,
  REPORTE_ESTILO_PAYMENTS_REPORT,
  REPORTE_ESTILO_CONNECTION_HISTORY,
  REPORTE_ESTILO_PAYMENT_AGREEMENT,
} from '../../../infrastructure/config/sistema-config.keys';

describe('ReportStyleService', () => {
  let service: ReportStyleService;
  let config: jest.Mocked<SistemaConfigService>;
  let loggerWarnSpy: jest.SpyInstance;

  const mockConfig = {
    getString: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportStyleService,
        { provide: SistemaConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<ReportStyleService>(ReportStyleService);
    config = module.get(SistemaConfigService);

    loggerWarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveStyle — happy path', () => {
    it('returns the report-specific value when present and valid (modern)', async () => {
      mockConfig.getString.mockResolvedValueOnce('modern');

      const result = await service.resolveStyle('payments-report');

      expect(result).toBe('modern');
      expect(mockConfig.getString).toHaveBeenCalledTimes(1);
      expect(mockConfig.getString).toHaveBeenCalledWith(
        REPORTE_ESTILO_PAYMENTS_REPORT,
      );
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('returns the report-specific value when present and valid (legacy)', async () => {
      mockConfig.getString.mockResolvedValueOnce('legacy');

      const result = await service.resolveStyle('connection-history');

      expect(result).toBe('legacy');
      expect(mockConfig.getString).toHaveBeenCalledWith(
        REPORTE_ESTILO_CONNECTION_HISTORY,
      );
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('uses the canonical clave for payment-agreement', async () => {
      mockConfig.getString.mockResolvedValueOnce('modern');

      const result = await service.resolveStyle('payment-agreement');

      expect(result).toBe('modern');
      expect(mockConfig.getString).toHaveBeenCalledWith(
        REPORTE_ESTILO_PAYMENT_AGREEMENT,
      );
    });
  });

  describe('resolveStyle — fallback chain', () => {
    it('falls back to the default key when the report-specific key returns null', async () => {
      mockConfig.getString
        .mockResolvedValueOnce(null) // report-specific missing
        .mockResolvedValueOnce('modern'); // default

      const result = await service.resolveStyle('payments-report');

      expect(result).toBe('modern');
      expect(mockConfig.getString).toHaveBeenCalledTimes(2);
      expect(mockConfig.getString).toHaveBeenNthCalledWith(
        1,
        REPORTE_ESTILO_PAYMENTS_REPORT,
      );
      expect(mockConfig.getString).toHaveBeenNthCalledWith(
        2,
        REPORTE_ESTILO_DEFAULT,
      );
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('falls back to the default key when the report-specific key returns an invalid value', async () => {
      mockConfig.getString
        .mockResolvedValueOnce('midnight') // garbage
        .mockResolvedValueOnce('legacy'); // default

      const result = await service.resolveStyle('connection-history');

      expect(result).toBe('legacy');
      expect(mockConfig.getString).toHaveBeenCalledTimes(2);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('falls back to hardcoded legacy + warn when both keys are missing', async () => {
      mockConfig.getString
        .mockResolvedValueOnce(null) // report-specific missing
        .mockResolvedValueOnce(null); // default missing

      const result = await service.resolveStyle('payment-agreement');

      expect(result).toBe('legacy');
      expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('payment-agreement'),
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('legacy'),
      );
    });

    it('falls back to hardcoded legacy + warn when both keys return invalid values', async () => {
      mockConfig.getString
        .mockResolvedValueOnce('') // empty
        .mockResolvedValueOnce('banana'); // garbage

      const result = await service.resolveStyle('payment-agreement');

      expect(result).toBe('legacy');
      expect(mockConfig.getString).toHaveBeenCalledTimes(2);
      expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('resolveStyle — cache locality', () => {
    it('delegates cache reads to SistemaConfigService (no local caching layer)', async () => {
      mockConfig.getString.mockResolvedValue('modern');

      await service.resolveStyle('payments-report');
      await service.resolveStyle('payments-report');

      // Two calls — SistemaConfigService owns the cache. The dispatcher MUST
      // NOT add a second cache layer (REQ-11 / REQ-12 are owned upstream).
      expect(mockConfig.getString).toHaveBeenCalledTimes(2);
    });

    it('hits the underlying cache independently per report key', async () => {
      mockConfig.getString
        .mockResolvedValueOnce('modern') // payment
        .mockResolvedValueOnce('legacy'); // connection

      await service.resolveStyle('payments-report');
      await service.resolveStyle('connection-history');

      expect(mockConfig.getString).toHaveBeenCalledTimes(2);
      expect(mockConfig.getString).toHaveBeenCalledWith(
        REPORTE_ESTILO_PAYMENTS_REPORT,
      );
      expect(mockConfig.getString).toHaveBeenCalledWith(
        REPORTE_ESTILO_CONNECTION_HISTORY,
      );
    });
  });
});
