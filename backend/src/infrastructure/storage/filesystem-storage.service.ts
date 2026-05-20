import { Injectable, Logger } from '@nestjs/common';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
  statSync,
  readdirSync,
  createReadStream,
  createWriteStream,
} from 'fs';
import { join, dirname } from 'path';
import { Readable } from 'stream';
import { IStorageService, UploadOptions, UploadResult } from './interfaces/storage.interface';

/**
 * Filesystem-based fallback implementation of IStorageService
 * Mirrors the MinIO API but stores files on local disk
 */
@Injectable()
export class FilesystemStorageService implements IStorageService {
  private readonly logger = new Logger(FilesystemStorageService.name);
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.env.STORAGE_BASE_DIR || '/var/storage';
  }

  isMinIO(): boolean {
    return false;
  }

  /**
   * Resolves the full filesystem path for a bucket/key pair
   */
  private resolvePath(bucket: string, key: string): string {
    return join(this.baseDir, bucket, key);
  }

  /**
   * Ensures the directory for a file exists
   */
  private ensureDirectory(filePath: string): void {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  async upload(
    bucket: string,
    key: string,
    buffer: Buffer,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const fullPath = this.resolvePath(bucket, key);
    this.ensureDirectory(fullPath);

    writeFileSync(fullPath, buffer);
    this.logger.debug(`[FS:UPLOAD] ${bucket}/${key} (${buffer.length} bytes)`);

    return {
      key,
      size: buffer.length,
      contentType: options?.contentType || 'application/octet-stream',
    };
  }

  async uploadStream(
    bucket: string,
    key: string,
    stream: Readable,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const fullPath = this.resolvePath(bucket, key);
    this.ensureDirectory(fullPath);

    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(fullPath);
      let size = 0;

      stream.on('data', (chunk: Buffer) => {
        size += chunk.length;
        writeStream.write(chunk);
      });

      stream.on('end', () => {
        writeStream.end();
        this.logger.debug(`[FS:UPLOAD:STREAM] ${bucket}/${key} (${size} bytes)`);
        resolve({
          key,
          size,
          contentType: options?.contentType || 'application/octet-stream',
        });
      });

      stream.on('error', (err) => {
        writeStream.destroy();
        reject(err);
      });
    });
  }

  async getUrl(bucket: string, key: string): Promise<string> {
    // For filesystem, return the local path
    const fullPath = this.resolvePath(bucket, key);
    return `file://${fullPath}`;
  }

  async refreshUrl(bucket: string, key: string): Promise<string> {
    // Filesystem URLs don't expire, just return current path
    return this.getUrl(bucket, key);
  }

  async delete(bucket: string, key: string): Promise<void> {
    const fullPath = this.resolvePath(bucket, key);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      this.logger.debug(`[FS:DELETE] ${bucket}/${key}`);
    }
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    const fullPath = this.resolvePath(bucket, key);
    return existsSync(fullPath);
  }

  async list(bucket: string, prefix?: string): Promise<string[]> {
    const bucketDir = join(this.baseDir, bucket);

    if (!existsSync(bucketDir)) {
      return [];
    }

    // Scan files matching prefix
    const files = this.scanDirectory(bucketDir, prefix || '');
    return files;
  }

  /**
   * Recursively scan directory for files matching prefix
   */
  private scanDirectory(basePath: string, prefix: string): string[] {
    const files: string[] = [];

    const scan = (dirPath: string, prefixFilter: string) => {
      if (!existsSync(dirPath)) return;

      try {
        const entries = readdirSync(dirPath);

        for (const entry of entries) {
          const fullPath = join(dirPath, entry);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            scan(fullPath, prefixFilter);
          } else {
            const relativePath = fullPath.replace(basePath + '/', '');
            if (!prefixFilter || relativePath.startsWith(prefixFilter)) {
              files.push(relativePath);
            }
          }
        }
      } catch {
        // Ignore permission errors
      }
    };

    scan(basePath, prefix);
    return files;
  }

  async getObject(bucket: string, key: string): Promise<Readable> {
    const fullPath = this.resolvePath(bucket, key);
    return createReadStream(fullPath);
  }

  async getMetadata(
    bucket: string,
    key: string,
  ): Promise<{ size: number; contentType: string } | null> {
    const fullPath = this.resolvePath(bucket, key);

    if (!existsSync(fullPath)) {
      return null;
    }

    const stat = statSync(fullPath);
    return {
      size: stat.size,
      contentType: 'application/octet-stream',
    };
  }
}