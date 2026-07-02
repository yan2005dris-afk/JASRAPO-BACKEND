import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ReportStyleService } from './report-style.service';
import { SistemaConfigService } from '../../infrastructure/config/sistema-config.service';
import { REPORTE_ESTILO } from '../../infrastructure/config/sistema-config.keys';

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
    it('returns "modern" when the global value is "modern"', async () => {
      mockConfig.getString.mockResolvedValueOnce('modern');

      const result = await service.resolveStyle('payments-report');

      expect(result).toBe('modern');
      expect(mockConfig.getString).toHaveBeenCalledTimes(1);
      expect(mockConfig.getString).toHaveBeenCalledWith(REPORTE_ESTILO);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('returns "legacy" when the global value is "legacy"', async () => {
      mockConfig.getString.mockResolvedValueOnce('legacy');

      const result = await service.resolveStyle('connection-history');

      expect(result).toBe('legacy');
      expect(mockConfig.getString).toHaveBeenCalledWith(REPORTE_ESTILO);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('applies the same value to every report key (no per-key lookup)', async () => {
      mockConfig.getString.mockResolvedValue('modern');

      const a = await service.resolveStyle('payments-report');
      const b = await service.resolveStyle('connection-history');
      const c = await service.resolveStyle('payment-agreement');

      expect(a).toBe('modern');
      expect(b).toBe('modern');
      expect(c).toBe('modern');
      // All three calls hit the same key — no per-key branching.
      expect(mockConfig.getString).toHaveBeenCalledTimes(3);
      expect(mockConfig.getString).toHaveBeenCalledWith(REPORTE_ESTILO);
    });
  });

  describe('resolveStyle — fallback chain', () => {
    it('falls back to hardcoded legacy + warn when the key is missing (null)', async () => {
      mockConfig.getString.mockResolvedValueOnce(null);

      const result = await service.resolveStyle('payment-agreement');

      expect(result).toBe('legacy');
      expect(mockConfig.getString).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(REPORTE_ESTILO),
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('legacy'),
      );
    });

    it('falls back to hardcoded legacy + warn when the key returns an invalid value', async () => {
      mockConfig.getString.mockResolvedValueOnce('midnight');

      const result = await service.resolveStyle('connection-history');

      expect(result).toBe('legacy');
      expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('falls back to hardcoded legacy + warn when the key returns an empty string', async () => {
      mockConfig.getString.mockResolvedValueOnce('');

      const result = await service.resolveStyle('payments-report');

      expect(result).toBe('legacy');
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
  });
});