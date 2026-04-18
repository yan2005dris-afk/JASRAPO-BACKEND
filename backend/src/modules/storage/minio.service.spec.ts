import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';

describe('MinioService', () => {
  const minioUpMsg = '[MINIO:UP] Conexion a MinIO establecida correctamente';
  const minioDownMsg = '[MINIO:DOWN] No se pudo conectar a MinIO';

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

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when MINIO_PORT is invalid', () => {
    const configService = makeConfigService({ MINIO_PORT: 'abc' });

    expect(() => new MinioService(configService)).toThrow(
      'MINIO_PORT invalido: "abc". Debe ser un entero entre 1 y 65535.',
    );
  });

  it('throws when MINIO_USE_SSL is invalid', () => {
    const configService = makeConfigService({ MINIO_USE_SSL: '1' });

    expect(() => new MinioService(configService)).toThrow(
      'MINIO_USE_SSL invalido: "1". Usa "true" o "false".',
    );
  });

  it('accepts MINIO_USE_SSL when value has extra spaces', () => {
    const configService = makeConfigService({ MINIO_USE_SSL: ' TRUE ' });

    expect(() => new MinioService(configService)).not.toThrow();
  });

  it('logs MINIO:UP when connection check succeeds', async () => {
    const service = new MinioService(makeConfigService());
    const minioClientMock = {
      listBuckets: jest.fn().mockResolvedValue([]),
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn(),
    };

    (service as any).minioClient = minioClientMock;
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    await service.onModuleInit();

    expect(minioClientMock.listBuckets).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(minioUpMsg);
  });

  it('logs MINIO:DOWN and rethrows when connection check fails', async () => {
    const service = new MinioService(makeConfigService());
    const error = new Error('minio down');

    (service as any).minioClient = {
      listBuckets: jest.fn().mockRejectedValue(error),
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
    };

    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await expect(service.onModuleInit()).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(minioDownMsg, error.stack);
  });
});