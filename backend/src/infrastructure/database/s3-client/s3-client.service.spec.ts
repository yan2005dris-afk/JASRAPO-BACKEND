import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { S3ClientService } from './s3-client.service';
import type { ConfigService } from '@nestjs/config';

// Mock the S3 constructor only — individual commands are not strict-mocked
jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3ClientService', () => {
  let service: S3ClientService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockSend: jest.Mock;

  /**
   * Simulate a successful onModuleInit by controlling the S3Client mock.
   */
  async function initService(): Promise<void> {
    mockSend = jest.fn();
    (S3Client as jest.Mock).mockImplementation(() => ({ send: mockSend }));
    // First call (ListBuckets) succeeds
    mockSend.mockResolvedValueOnce({ Buckets: [] });
    // Ensure buckets: all 3 succeed via HeadBucket (no throw)
    mockSend.mockResolvedValueOnce({}); // HeadBucket avatars
    mockSend.mockResolvedValueOnce({}); // HeadBucket documents
    mockSend.mockResolvedValueOnce({}); // HeadBucket uploads

    await service.onModuleInit();
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          STORAGE_ENDPOINT: 'localhost',
          STORAGE_PORT: 9000,
          STORAGE_USE_SSL: 'false',
          STORAGE_ACCESS_KEY: 'admin',
          STORAGE_SECRET_KEY: 'password123',
        };
        return config[key] ?? defaultValue;
      },
    );

    service = new S3ClientService(mockConfigService);
  });

  // --- onModuleInit ---

  describe('onModuleInit', () => {
    it('should connect and initialize default buckets on startup', async () => {
      const send = jest.fn();
      (S3Client as jest.Mock).mockImplementation(() => ({ send }));
      send.mockResolvedValueOnce({ Buckets: [] });
      send.mockResolvedValueOnce({}); // HeadBucket avatars — exists
      send.mockResolvedValueOnce({}); // HeadBucket documents — exists
      send.mockResolvedValueOnce({}); // HeadBucket uploads — exists

      await service.onModuleInit();

      expect(service.isAvailable).toBe(true);
      expect(send).toHaveBeenCalled();
    });

    it('should handle S3 connection failure on startup', async () => {
      const send = jest.fn();
      (S3Client as jest.Mock).mockImplementation(() => ({ send }));
      send.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(service.onModuleInit()).rejects.toThrow(
        '[S3] Failed to connect',
      );
      expect(service.isAvailable).toBe(false);
    });
  });

  // --- uploadFile ---

  describe('uploadFile', () => {
    it('should upload a buffer to a bucket and return the file name', async () => {
      await initService();
      // EnsureBucket (HeadBucket) succeeds
      mockSend.mockResolvedValueOnce({});
      // PutObject succeeds
      mockSend.mockResolvedValueOnce({ ETag: '"abc123"' });

      const result = await service.uploadFile(
        'test-bucket',
        'test.txt',
        Buffer.from('data'),
      );

      expect(result).toBe('test.txt');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'test-bucket',
            Key: 'test.txt',
            Body: expect.any(Buffer),
          },
        }),
      );
    });

    it('should throw if service is not available', async () => {
      // Don't call initService — service stays unavailable
      await expect(
        service.uploadFile('bucket', 'key', Buffer.from('data')),
      ).rejects.toThrow('S3-compatible storage is not available');
    });
  });

  // --- deleteFile ---

  describe('deleteFile', () => {
    it('should delete an object from a bucket', async () => {
      await initService();
      mockSend.mockResolvedValueOnce({});
      await service.deleteFile('bucket', 'key.txt');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { Bucket: 'bucket', Key: 'key.txt' },
        }),
      );
    });
  });

  // --- fileExists ---

  describe('fileExists', () => {
    it('should return true when object exists', async () => {
      await initService();
      mockSend.mockResolvedValueOnce({ ContentLength: 100 });
      const result = await service.fileExists('bucket', 'key.txt');
      expect(result).toBe(true);
    });

    it('should return false when object does not exist', async () => {
      await initService();
      mockSend.mockRejectedValueOnce(new Error('Not found'));
      const result = await service.fileExists('bucket', 'missing.txt');
      expect(result).toBe(false);
    });

    it('should return false when service is unavailable', async () => {
      // Don't call initService
      const result = await service.fileExists('bucket', 'key.txt');
      expect(result).toBe(false);
    });
  });

  // --- getFileMetadata ---

  describe('getFileMetadata', () => {
    it('should return file metadata for existing object', async () => {
      await initService();
      const mockDate = new Date('2024-01-15');
      mockSend.mockResolvedValueOnce({
        ContentLength: 1024,
        ContentType: 'image/jpeg',
        LastModified: mockDate,
      });
      const result = await service.getFileMetadata('bucket', 'photo.jpg');
      expect(result).toEqual({
        size: 1024,
        contentType: 'image/jpeg',
        lastModified: mockDate,
      });
    });

    it('should return null when object does not exist', async () => {
      await initService();
      mockSend.mockRejectedValueOnce(new Error('Not found'));
      const result = await service.getFileMetadata('bucket', 'missing.jpg');
      expect(result).toBeNull();
    });

    it('should return null when service is unavailable', async () => {
      const result = await service.getFileMetadata('bucket', 'key.jpg');
      expect(result).toBeNull();
    });
  });

  // --- getPresignedUrl ---

  describe('getPresignedUrl', () => {
    it('should return a presigned URL with default expiration', async () => {
      await initService();
      (getSignedUrl as jest.Mock).mockResolvedValueOnce(
        'https://s3.local/file.txt?token=xyz',
      );
      const url = await service.getPresignedUrl('bucket', 'file.txt');
      expect(url).toBe('https://s3.local/file.txt?token=xyz');
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { expiresIn: 86400 },
      );
    });

    it('should accept custom expiration', async () => {
      await initService();
      (getSignedUrl as jest.Mock).mockResolvedValueOnce(
        'https://s3.local/file.txt?token=xyz',
      );
      await service.getPresignedUrl('bucket', 'file.txt', 3600);
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { expiresIn: 3600 },
      );
    });
  });

  // --- getFileStream ---

  describe('getFileStream', () => {
    it('should return a Readable stream from GetObjectCommand', async () => {
      await initService();
      const mockStream = new Readable({
        read() {
          this.push('test data');
          this.push(null);
        },
      });
      mockSend.mockResolvedValueOnce({ Body: mockStream });
      const stream = await service.getFileStream('bucket', 'file.txt');
      expect(stream).toBeInstanceOf(Readable);
    });
  });

  // --- listFiles ---

  describe('listFiles', () => {
    it('should return list of file keys from bucket', async () => {
      await initService();
      mockSend.mockResolvedValueOnce({}); // HeadBucket (ensureBucket)
      mockSend.mockResolvedValueOnce({
        Contents: [{ Key: 'file1.txt' }, { Key: 'file2.txt' }],
      });
      const files = await service.listFiles('bucket');
      expect(files).toEqual(['file1.txt', 'file2.txt']);
    });

    it('should filter by prefix when provided', async () => {
      await initService();
      mockSend.mockResolvedValueOnce({}); // HeadBucket
      mockSend.mockResolvedValueOnce({
        Contents: [{ Key: '2026/05/file1.txt' }],
      });
      const files = await service.listFiles('bucket', '2026/05/');
      expect(files).toEqual(['2026/05/file1.txt']);
    });

    it('should return empty array when no files match', async () => {
      await initService();
      mockSend.mockResolvedValueOnce({}); // HeadBucket
      mockSend.mockResolvedValueOnce({ Contents: undefined });
      const files = await service.listFiles('bucket');
      expect(files).toEqual([]);
    });
  });

  // --- ensureBucket ---

  describe('ensureBucket', () => {
    it('should create bucket if it does not exist', async () => {
      await initService();
      mockSend.mockRejectedValueOnce(new Error('Not found')); // HeadBucket fails
      mockSend.mockResolvedValueOnce({}); // CreateBucket succeeds
      mockSend.mockResolvedValueOnce({ ETag: '"abc"' }); // PutObject
      await service.uploadFile('new-bucket', 'test.txt', Buffer.from('data'));
      // Should have called CreateBucketCommand
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { Bucket: 'new-bucket' },
        }),
      );
    });
  });
});
