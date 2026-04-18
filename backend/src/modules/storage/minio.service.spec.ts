import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';

describe('MinioService', () => {
  const makeConfigService = (overrides?: Record<string, string>) => {
    const values: Record<string, string> = {
      MINIO_ENDPOINT: 'localhost',
      MINIO_PORT: '9000',
      MINIO_USE_SSL: 'false',
      MINIO_ACCESS_KEY: 'minio',
      MINIO_SECRET_KEY: 'minio123',
      MINIO_ENABLED: 'true',
      ...overrides,
    };
    return {
      getOrThrow: jest.fn((key: string) => {
        if (!values[key]) throw new Error(`Missing key: ${key}`);
        return values[key];
      }),
      get: jest.fn((key: string, defaultValue?: string) => {
        return values[key] ?? defaultValue;
      }),
    } as unknown as ConfigService;
  };

  it('should create service instance', () => {
    const configService = makeConfigService();
    const service = new MinioService(configService);
    expect(service).toBeDefined();
  });

  it('Should have isAvailable default false', () => {
    const configService = makeConfigService();
    const service = new MinioService(configService);
    expect(service.isAvailable).toBe(false);
  });

  it('Should have default buckets defined', () => {
    const configService = makeConfigService();
    const service = new MinioService(configService);
    // Accedemos a la propiedad privada para verificar
    expect((service as any).defaultBuckets).toContain('avatars');
    expect((service as any).defaultBuckets).toContain('documents');
    expect((service as any).defaultBuckets).toContain('uploads');
  });
});
