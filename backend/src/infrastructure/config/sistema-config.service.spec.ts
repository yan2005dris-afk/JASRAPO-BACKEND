import type { ConfigService } from '@nestjs/config';
import type { SistemaConfigRepository } from './sistema-config.repository';
import {
  __resetSistemaConfigCache,
  SistemaConfigService,
} from './sistema-config.service';

describe('SistemaConfigService', () => {
  let service: SistemaConfigService;
  let repository: jest.Mocked<Pick<SistemaConfigRepository, 'findByClave'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const makeConfig = (ttl: number | undefined) =>
    ({
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'SISTEMA_CONFIG_CACHE_TTL_MS') {
          return ttl ?? defaultValue;
        }
        return defaultValue;
      }),
    }) as unknown as jest.Mocked<Pick<ConfigService, 'get'>>;

  const makeRepository = () =>
    ({
      findByClave: jest.fn(),
    }) as unknown as jest.Mocked<Pick<SistemaConfigRepository, 'findByClave'>>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-02T12:00:00.000Z'));
    __resetSistemaConfigCache();
    repository = makeRepository();
    configService = makeConfig(undefined);
    service = new SistemaConfigService(
      repository as unknown as SistemaConfigRepository,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getString - cache miss and hit', () => {
    it('reads from the repository on a cold call', async () => {
      repository.findByClave.mockResolvedValue('modern');

      const result = await service.getString('reporte.estilo.default');

      expect(result).toBe('modern');
      expect(repository.findByClave).toHaveBeenCalledTimes(1);
      expect(repository.findByClave).toHaveBeenCalledWith(
        'reporte.estilo.default',
      );
    });

    it('does not call the repository on a second call within the TTL window', async () => {
      repository.findByClave.mockResolvedValue('modern');

      const first = await service.getString('reporte.estilo.default');
      jest.advanceTimersByTime(5_000);
      const second = await service.getString('reporte.estilo.default');

      expect(first).toBe('modern');
      expect(second).toBe('modern');
      expect(repository.findByClave).toHaveBeenCalledTimes(1);
    });

    it('re-reads from the repository after the TTL has elapsed', async () => {
      repository.findByClave
        .mockResolvedValueOnce('legacy')
        .mockResolvedValueOnce('modern');

      const first = await service.getString('reporte.estilo.payments-report');
      jest.advanceTimersByTime(60_001);
      const second = await service.getString('reporte.estilo.payments-report');

      expect(first).toBe('legacy');
      expect(second).toBe('modern');
      expect(repository.findByClave).toHaveBeenCalledTimes(2);
    });

    it('treats expiresAt === now as expired (strict > comparison)', async () => {
      repository.findByClave
        .mockResolvedValueOnce('legacy')
        .mockResolvedValueOnce('modern');

      await service.getString('reporte.estilo.payments-report');
      jest.advanceTimersByTime(60_000);
      const result = await service.getString('reporte.estilo.payments-report');

      expect(result).toBe('modern');
      expect(repository.findByClave).toHaveBeenCalledTimes(2);
    });
  });

  describe('getString - null caching', () => {
    it('caches null results so missing keys do not hammer the database', async () => {
      repository.findByClave.mockResolvedValue(null);

      const first = await service.getString('reporte.estilo.absent');
      jest.advanceTimersByTime(10_000);
      const second = await service.getString('reporte.estilo.absent');

      expect(first).toBeNull();
      expect(second).toBeNull();
      expect(repository.findByClave).toHaveBeenCalledTimes(1);
    });

    it('re-reads null after the TTL elapses', async () => {
      repository.findByClave
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('modern');

      const first = await service.getString('reporte.estilo.absent');
      jest.advanceTimersByTime(60_001);
      const second = await service.getString('reporte.estilo.absent');

      expect(first).toBeNull();
      expect(second).toBe('modern');
      expect(repository.findByClave).toHaveBeenCalledTimes(2);
    });
  });

  describe('TTL configuration', () => {
    it('uses a 60s default TTL when SISTEMA_CONFIG_CACHE_TTL_MS is unset', async () => {
      repository.findByClave.mockResolvedValue('modern');

      await service.getString('reporte.estilo.default');
      jest.advanceTimersByTime(59_999);
      await service.getString('reporte.estilo.default');

      expect(repository.findByClave).toHaveBeenCalledTimes(1);
    });

    it('honors a custom SISTEMA_CONFIG_CACHE_TTL_MS from ConfigService', async () => {
      const customConfig = makeConfig(5_000);
      const customService = new SistemaConfigService(
        repository as unknown as SistemaConfigRepository,
        customConfig as unknown as ConfigService,
      );
      repository.findByClave.mockResolvedValue('modern');

      await customService.getString('reporte.estilo.default');
      jest.advanceTimersByTime(5_001);
      await customService.getString('reporte.estilo.default');

      expect(repository.findByClave).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache state', () => {
    it('keeps the cache empty until the first call', () => {
      expect(service.cacheSize).toBe(0);
    });

    it('grows the cache to one entry after a hit', async () => {
      repository.findByClave.mockResolvedValue('modern');

      expect(service.cacheSize).toBe(0);
      await service.getString('reporte.estilo.default');
      expect(service.cacheSize).toBe(1);
    });

    it('keeps a single entry on repeated calls for the same key', async () => {
      repository.findByClave.mockResolvedValue('modern');

      await service.getString('reporte.estilo.default');
      await service.getString('reporte.estilo.default');
      await service.getString('reporte.estilo.default');

      expect(service.cacheSize).toBe(1);
    });

    it('caches different keys independently', async () => {
      repository.findByClave.mockImplementation(async (clave) => {
        if (clave === 'reporte.estilo.default') return 'modern';
        if (clave === 'reporte.estilo.payments-report') return 'legacy';
        return null;
      });

      await service.getString('reporte.estilo.default');
      await service.getString('reporte.estilo.payments-report');

      expect(service.cacheSize).toBe(2);
      expect(repository.findByClave).toHaveBeenCalledTimes(2);
    });
  });

  describe('cold start', () => {
    it('starts with an empty cache after __resetSistemaConfigCache()', async () => {
      repository.findByClave.mockResolvedValue('modern');
      await service.getString('reporte.estilo.default');
      expect(service.cacheSize).toBe(1);

      __resetSistemaConfigCache();
      const freshService = new SistemaConfigService(
        repository as unknown as SistemaConfigRepository,
        configService as unknown as ConfigService,
      );

      expect(freshService.cacheSize).toBe(0);
    });
  });
});
