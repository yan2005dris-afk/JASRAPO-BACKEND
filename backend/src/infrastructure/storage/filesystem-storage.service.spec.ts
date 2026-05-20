import { FilesystemStorageService } from './filesystem-storage.service';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('FilesystemStorageService', () => {
  const mockBaseDir = '/tmp/test-storage';
  let service: FilesystemStorageService;

  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(mockBaseDir)) {
      rmSync(mockBaseDir, { recursive: true, force: true });
    }
    service = new FilesystemStorageService(mockBaseDir);
  });

  describe('isMinIO', () => {
    it('should always return false for filesystem fallback', () => {
      const service = new FilesystemStorageService(mockBaseDir);
      expect(service.isMinIO()).toBe(false);
    });
  });

  describe('upload', () => {
    it('should store buffer at {baseDir}/{bucket}/{key}', async () => {
      const service = new FilesystemStorageService(mockBaseDir);
      const buffer = Buffer.from('<xml>test content</xml>');

      const result = await service.upload('sri-xmls', 'test.xml', buffer);

      expect(result.key).toBe('test.xml');
      expect(result.size).toBe(buffer.length);
      expect(result.contentType).toBe('application/octet-stream');
    });

    it('should handle nested keys', async () => {
      const service = new FilesystemStorageService(mockBaseDir);
      const buffer = Buffer.from('data');

      const result = await service.upload(
        'sri-xmls',
        '2026/05/sin_firmar/12345678901234567890123456789012345678901234567890.xml',
        buffer,
      );

      expect(result.key).toContain('2026/05/sin_firmar/');
    });
  });

  describe('exists', () => {
    it('should return true for existing files', async () => {
      const service = new FilesystemStorageService(mockBaseDir);
      await service.upload('sri-xmls', 'exists.xml', Buffer.from('content'));

      const result = await service.exists('sri-xmls', 'exists.xml');

      expect(result).toBe(true);
    });

    it('should return false for non-existing files', async () => {
      const service = new FilesystemStorageService(mockBaseDir);

      const result = await service.exists('sri-xmls', 'missing.xml');

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove existing file', async () => {
      const service = new FilesystemStorageService(mockBaseDir);
      await service.upload('sri-xmls', 'to-delete.xml', Buffer.from('content'));

      await service.delete('sri-xmls', 'to-delete.xml');

      const exists = await service.exists('sri-xmls', 'to-delete.xml');
      expect(exists).toBe(false);
    });
  });

  describe('getObject', () => {
    it('should return readable stream', async () => {
      const service = new FilesystemStorageService(mockBaseDir);
      await service.upload(
        'sri-xmls',
        'stream-test.xml',
        Buffer.from('stream content'),
      );

      const stream = await service.getObject('sri-xmls', 'stream-test.xml');

      expect(stream).toBeDefined();
      expect(typeof stream.pipe).toBe('function');
    });
  });

  describe('list', () => {
    it('should list files with prefix', async () => {
      // Fresh instance with clean directory
      if (existsSync(mockBaseDir)) {
        rmSync(mockBaseDir, { recursive: true, force: true });
      }
      const service = new FilesystemStorageService(mockBaseDir);
      await service.upload('sri-xmls', 'docs/file1.xml', Buffer.from('a'));
      await service.upload('sri-xmls', 'docs/file2.xml', Buffer.from('b'));
      await service.upload('sri-xmls', 'archive/file3.xml', Buffer.from('c'));

      const files = await service.list('sri-xmls', 'docs/');

      expect(files).toHaveLength(2);
      expect(files.some((f) => f.includes('file1.xml'))).toBe(true);
      expect(files.some((f) => f.includes('file2.xml'))).toBe(true);
    });
  });

  describe('getUrl', () => {
    it('should return local file path as URL', async () => {
      const service = new FilesystemStorageService(mockBaseDir);

      const url = await service.getUrl('sri-xmls', 'test.xml');

      expect(url).toContain('test.xml');
    });
  });

  describe('refreshUrl', () => {
    it('should return fresh URL (same implementation as getUrl for filesystem)', async () => {
      const service = new FilesystemStorageService(mockBaseDir);

      const url = await service.refreshUrl('sri-xmls', 'test.xml');

      expect(url).toContain('test.xml');
    });
  });

  describe('getMetadata', () => {
    it('should return file size', async () => {
      const service = new FilesystemStorageService(mockBaseDir);
      const buffer = Buffer.from('metadata test content');
      await service.upload('sri-xmls', 'meta.xml', buffer, {
        contentType: 'application/xml',
      });

      const metadata = await service.getMetadata('sri-xmls', 'meta.xml');

      expect(metadata?.size).toBeGreaterThan(0);
      // Filesystem doesn't track content type, returns octet-stream
      expect(metadata?.contentType).toBe('application/octet-stream');
    });
  });
});
