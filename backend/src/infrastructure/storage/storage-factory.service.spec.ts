import { StorageServiceFactory } from './storage-factory.service';
import type { MinioStorageService } from './minio-storage.service';
import type { FilesystemStorageService } from './filesystem-storage.service';
import type { ConfigService } from '@nestjs/config';
import type { IStorageService } from './interfaces/storage.interface';

describe('StorageServiceFactory', () => {
  let factory: StorageServiceFactory;
  let mockMinioService: jest.Mocked<MinioStorageService>;
  let mockFsService: jest.Mocked<FilesystemStorageService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const makeMockMinioService = () => ({
    isMinIO: jest.fn().mockReturnValue(true),
    isAvailable: jest.fn().mockReturnValue(true),
  });

  const makeMockFsService = () => ({
    isMinIO: jest.fn().mockReturnValue(false),
    isAvailable: jest.fn().mockReturnValue(true),
  });

  const makeMockConfigService = () => ({
    get: jest.fn(),
  });

  beforeEach(() => {
    mockMinioService =
      makeMockMinioService() as unknown as jest.Mocked<MinioStorageService>;
    mockFsService =
      makeMockFsService() as unknown as jest.Mocked<FilesystemStorageService>;
    mockConfigService = makeMockConfigService() as unknown as jest.Mocked<ConfigService>;
  });

  describe('getStorageService', () => {
    it('should return MinIO service when MINIO_ENABLED and MinIO available', () => {
      mockConfigService.get.mockReturnValue('true');
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      const service = factory.getStorageService();

      expect(service.isMinIO()).toBe(true);
    });

    it('should return filesystem when MINIO_ENABLED=false', () => {
      mockConfigService.get.mockReturnValue('false');
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      const service = factory.getStorageService();

      expect(service.isMinIO()).toBe(false);
    });

    it('should return filesystem when MinIO is not available', () => {
      mockConfigService.get.mockReturnValue('true');
      mockMinioService.isAvailable.mockReturnValue(false);
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      const service = factory.getStorageService();

      expect(service.isMinIO()).toBe(false);
    });

    it('should cache the storage service after first call', () => {
      mockConfigService.get.mockReturnValue('true');
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      const service1 = factory.getStorageService();
      const service2 = factory.getStorageService();

      expect(service1).toBe(service2);
    });

    it('should handle case-insensitive MINIO_ENABLED value', () => {
      mockConfigService.get.mockReturnValue('FALSE');
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      const service = factory.getStorageService();

      expect(service.isMinIO()).toBe(false);
    });
  });

  describe('isUsingMinIO', () => {
    it('should return true when using MinIO', () => {
      mockConfigService.get.mockReturnValue('true');
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      expect(factory.isUsingMinIO()).toBe(true);
    });

    it('should return false when using filesystem', () => {
      mockConfigService.get.mockReturnValue('false');
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      expect(factory.isUsingMinIO()).toBe(false);
    });
  });

  describe('getSriBuckets', () => {
    it('should return SRI_BUCKETS constant', () => {
      factory = new StorageServiceFactory(
        mockMinioService,
        mockFsService,
        mockConfigService,
      );

      const buckets = factory.getSriBuckets();

      expect(buckets.XMLS).toBe('sri-xmls');
      expect(buckets.TEMPLATES).toBe('sri-templates');
      expect(buckets.PDFS).toBe('sri-pdfs');
      expect(buckets.IMAGES).toBe('sri-images');
      expect(buckets.CERTS).toBe('sri-certs');
    });
  });
});
