import { Readable } from 'stream';
import { StorageService, SRI_BUCKETS } from './storage.service';
import type { S3ClientService } from '../database/s3-client/s3-client.service';
import type { ConfigService } from '@nestjs/config';

describe('StorageService', () => {
  let service: StorageService;
  let mockS3ClientService: jest.Mocked<S3ClientService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const makeMockS3ClientService = () => ({
    isAvailable: true,
    uploadFile: jest.fn().mockResolvedValue('test.xml'),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    fileExists: jest.fn().mockResolvedValue(true),
    getPresignedUrl: jest
      .fn()
      .mockResolvedValue('https://minio.local/test.xml?token=abc'),
    getFileStream: jest.fn().mockResolvedValue(new Readable()),
    listFiles: jest.fn().mockResolvedValue(['file1.xml', 'file2.xml']),
    getFileMetadata: jest.fn().mockResolvedValue({
      size: 1024,
      contentType: 'application/xml',
      lastModified: new Date(),
    }),
  });

  const makeMockConfigService = () => ({
    get: jest.fn(),
  });

  beforeEach(() => {
    mockS3ClientService =
      makeMockS3ClientService() as unknown as jest.Mocked<S3ClientService>;
    mockConfigService =
      makeMockConfigService() as unknown as jest.Mocked<ConfigService>;
    service = new StorageService(mockS3ClientService, mockConfigService);
  });

  describe('upload', () => {
    it('should upload buffer to specified bucket and key', async () => {
      const buffer = Buffer.from('<xml>test</xml>');
      const result = await service.upload('sri-xmls', 'test.xml', buffer);

      expect(mockS3ClientService.uploadFile).toHaveBeenCalledWith(
        'sri-xmls',
        'test.xml',
        buffer,
      );
      expect(result.key).toBe('test.xml');
      expect(result.size).toBe(buffer.length);
      expect(result.contentType).toBe('application/octet-stream');
    });

    it('should use contentType from options', async () => {
      const buffer = Buffer.from('<xml>test</xml>');
      const result = await service.upload('sri-xmls', 'test.xml', buffer, {
        contentType: 'application/xml',
      });

      expect(result.contentType).toBe('application/xml');
    });

    it('should default to octet-stream when no contentType provided', async () => {
      const buffer = Buffer.from('binary data');
      const result = await service.upload('sri-pdfs', 'report.pdf', buffer);

      expect(result.contentType).toBe('application/octet-stream');
    });
  });

  describe('getUrl', () => {
    it('should return presigned URL with the given expiration', async () => {
      const url = await service.getUrl('sri-xmls', 'test.xml', 600);

      expect(mockS3ClientService.getPresignedUrl).toHaveBeenCalledWith(
        'sri-xmls',
        'test.xml',
        600,
      );
      expect(url).toBe('https://minio.local/test.xml?token=abc');
    });

    it('should accept custom expiration within the 60-minute cap', async () => {
      await service.getUrl('sri-xmls', 'test.xml', 3600);

      expect(mockS3ClientService.getPresignedUrl).toHaveBeenCalledWith(
        'sri-xmls',
        'test.xml',
        3600,
      );
    });

    it('should throw when expiration exceeds the 60-minute cap', async () => {
      await expect(
        service.getUrl('sri-xmls', 'test.xml', 86400),
      ).rejects.toThrow('capped at 3600s');
    });

    it('should throw when expiration is zero or negative', async () => {
      await expect(service.getUrl('sri-xmls', 'test.xml', 0)).rejects.toThrow(
        'Invalid expiresInSeconds',
      );
      await expect(service.getUrl('sri-xmls', 'test.xml', -1)).rejects.toThrow(
        'Invalid expiresInSeconds',
      );
    });
  });

  describe('delete', () => {
    it('should delete object from bucket', async () => {
      await service.delete('sri-xmls', 'test.xml');

      expect(mockS3ClientService.deleteFile).toHaveBeenCalledWith(
        'sri-xmls',
        'test.xml',
      );
    });
  });

  describe('exists', () => {
    it('should return true when file exists', async () => {
      mockS3ClientService.fileExists.mockResolvedValue(true);
      const result = await service.exists('sri-xmls', 'test.xml');

      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      mockS3ClientService.fileExists.mockResolvedValue(false);
      const result = await service.exists('sri-xmls', 'missing.xml');

      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('should list files with optional prefix', async () => {
      const result = await service.list('sri-xmls', '2026/05/');

      expect(mockS3ClientService.listFiles).toHaveBeenCalledWith(
        'sri-xmls',
        '2026/05/',
      );
      expect(result).toHaveLength(2);
      expect(result).toContain('file1.xml');
    });

    it('should list all files when no prefix provided', async () => {
      const result = await service.list('sri-xmls');

      expect(mockS3ClientService.listFiles).toHaveBeenCalledWith(
        'sri-xmls',
        undefined,
      );
    });
  });

  describe('getObject', () => {
    it('should return readable stream for object', async () => {
      const stream = await service.getObject('sri-xmls', 'test.xml');

      expect(mockS3ClientService.getFileStream).toHaveBeenCalledWith(
        'sri-xmls',
        'test.xml',
      );
      expect(stream).toBeInstanceOf(Readable);
    });
  });

  describe('refreshUrl', () => {
    it('should regenerate presigned URL with the given expiration', async () => {
      const url = await service.refreshUrl('sri-xmls', 'test.xml', 900);

      expect(mockS3ClientService.getPresignedUrl).toHaveBeenCalledWith(
        'sri-xmls',
        'test.xml',
        900,
      );
      expect(url).toBe('https://minio.local/test.xml?token=abc');
    });

    it('should throw when expiration exceeds the 60-minute cap', async () => {
      await expect(
        service.refreshUrl('sri-xmls', 'test.xml', 7200),
      ).rejects.toThrow('capped at 3600s');
    });
  });

  describe('getMetadata', () => {
    it('should return file metadata', async () => {
      const metadata = await service.getMetadata('sri-xmls', 'test.xml');

      expect(metadata).toEqual({
        size: 1024,
        contentType: 'application/xml',
      });
    });

    it('should return null when file does not exist', async () => {
      mockS3ClientService.getFileMetadata.mockResolvedValue(null);
      const metadata = await service.getMetadata('sri-xmls', 'missing.xml');

      expect(metadata).toBeNull();
    });
  });
});

describe('SRI_BUCKETS', () => {
  it('should define all required SRI storage buckets', () => {
    expect(SRI_BUCKETS.XMLS).toBe('sri-xmls');
    expect(SRI_BUCKETS.TEMPLATES).toBe('sri-templates');
    expect(SRI_BUCKETS.PDFS).toBe('sri-pdfs');
    expect(SRI_BUCKETS.IMAGES).toBe('sri-images');
    expect(SRI_BUCKETS.CERTS).toBe('sri-certs');
  });

  it('should be frozen to prevent mutation', () => {
    expect(Object.isFrozen(SRI_BUCKETS)).toBe(true);
  });
});
