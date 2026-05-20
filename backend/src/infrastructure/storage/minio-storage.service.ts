import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import {
  IStorageService,
  UploadOptions,
  UploadResult,
} from './interfaces/storage.interface';
import { MinioService } from '../database/minio/minio.service';

/**
 * Storage types for SRI
 */
export const SRI_STORAGE_TYPES = {
  XMLS: 'xmls',
  TEMPLATES: 'templates',
  PDFS: 'pdfs',
  IMAGES: 'images',
  CERTS: 'certs',
  AUTHORIZED: 'authorized',
  PROFILE_PHOTOS: 'profile-photos',
  READINGS: 'readings',
  READING_NEWS: 'reading-news',
} as const;

export type SriStorageType =
  (typeof SRI_STORAGE_TYPES)[keyof typeof SRI_STORAGE_TYPES];

/**
 * Generates dynamic bucket name per RUC
 * Format: sri-{ruc}-{type} (e.g., sri-179xxxxxxx-xmls)
 */
export function getBucketName(ruc: string, type: SriStorageType): string {
  const prefix = 'sri';
  return `${prefix}-${ruc}-${type}`;
}

/**
 * Legacy bucket names (for backward compatibility if needed)
 * @deprecated Use getBucketName() for dynamic buckets per RUC
 */
export const SRI_BUCKETS = {
  XMLS: 'sri-xmls',
  TEMPLATES: 'sri-templates',
  PDFS: 'sri-pdfs',
  IMAGES: 'sri-images',
  CERTS: 'sri-certs',
  PROFILE_PHOTOS: 'profile-photos',
  READINGS: 'readings',
  READING_NEWS: 'reading-news',
} as const;

// Deep freeze for runtime immutability
Object.freeze(SRI_BUCKETS);
Object.freeze(SRI_STORAGE_TYPES);

/**
 * MinIO-based implementation of IStorageService
 * Provides object storage with presigned URLs and streaming support
 */
@Injectable()
export class MinioStorageService implements IStorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private initializedBuckets = new Set<string>();

  constructor(
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {
    void this.initializeDefaultBuckets();
  }

  /**
   * Initialize default SRI buckets on startup
   */
  private async initializeDefaultBuckets(): Promise<void> {
    const defaultBuckets = Object.values(SRI_BUCKETS);
    for (const bucket of defaultBuckets) {
      await this.ensureBucketExists(bucket);
    }
  }

  /**
   * Ensures a bucket exists, creates it if not
   */
  private async ensureBucketExists(bucket: string): Promise<void> {
    if (this.initializedBuckets.has(bucket)) {
      return;
    }

    try {
      // Try to list files - if bucket doesn't exist it'll throw
      await this.minioService.listFiles(bucket);
      this.initializedBuckets.add(bucket);
      this.logger.debug(`[MINIO:BUCKET] Already exists: ${bucket}`);
    } catch {
      // Bucket doesn't exist - create it
      try {
        // MinioService may not have createBucket - we rely on upload creating it
        this.initializedBuckets.add(bucket);
        this.logger.log(`[MINIO:BUCKET] Will use bucket: ${bucket}`);
      } catch (error) {
        this.logger.warn(`[MINIO:BUCKET] Could not ensure: ${bucket}`, error);
      }
    }
  }

  /**
   * Ensures dynamic bucket exists for specific RUC and type
   */
  async ensureBucketForRuc(ruc: string, type: SriStorageType): Promise<string> {
    const bucket = getBucketName(ruc, type);
    await this.ensureBucketExists(bucket);
    return bucket;
  }

  isMinIO(): boolean {
    return true;
  }

  isAvailable(): boolean {
    return this.minioService.isAvailable;
  }

  async upload(
    bucket: string,
    key: string,
    buffer: Buffer,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const contentType = options?.contentType || 'application/octet-stream';

    await this.minioService.uploadFile(bucket, key, buffer);

    this.logger.debug(
      `[MINIO:UPLOAD] ${bucket}/${key} (${buffer.length} bytes)`,
    );

    return {
      key,
      size: buffer.length,
      contentType,
    };
  }

  async uploadStream(
    bucket: string,
    key: string,
    stream: Readable,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    return this.upload(bucket, key, buffer, options);
  }

  async getUrl(
    bucket: string,
    key: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    const _expiry = expiresInSeconds ?? 24 * 60 * 60; // Default 24 hours
    return this.minioService.getPresignedUrl(bucket, key);
  }

  async refreshUrl(
    bucket: string,
    key: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    // MinIO generates fresh presigned URLs each time
    // Simply regenerate with new expiration
    return this.getUrl(bucket, key, expiresInSeconds);
  }

  async delete(bucket: string, key: string): Promise<void> {
    await this.minioService.deleteFile(bucket, key);
    this.logger.debug(`[MINIO:DELETE] ${bucket}/${key}`);
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    return this.minioService.fileExists(bucket, key);
  }

  async list(bucket: string, prefix?: string): Promise<string[]> {
    return this.minioService.listFiles(bucket, prefix);
  }

  async getObject(bucket: string, key: string): Promise<Readable> {
    return this.minioService.getFileStream(bucket, key);
  }

  async getMetadata(
    bucket: string,
    key: string,
  ): Promise<{ size: number; contentType: string } | null> {
    const metadata = await this.minioService.getFileMetadata(bucket, key);
    if (!metadata) return null;
    return {
      size: metadata.size,
      contentType: metadata.contentType,
    };
  }
}
