import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import {
  IStorageService,
  UploadOptions,
  UploadResult,
} from './interfaces/storage.interface';
import { S3ClientService } from '../database/s3-client/s3-client.service';

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
  COMPROBANTES: 'comprobantes',
} as const;

export type SriStorageType =
  (typeof SRI_STORAGE_TYPES)[keyof typeof SRI_STORAGE_TYPES];

/**
 * Generates dynamic bucket name per RUC
 * Format: sri-{ruc}-{type} (e.g., sri-179xxxxxxx-xmls)
 */
export function getBucketName(
  ruc: string,
  type: SriStorageType,
  prefix = 'sri',
): string {
  const cleanPrefix = prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
  return `${cleanPrefix}-${ruc}-${type}`;
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
  COMPROBANTES: 'comprobantes',
} as const;

// Deep freeze for runtime immutability
Object.freeze(SRI_BUCKETS);
Object.freeze(SRI_STORAGE_TYPES);

/**
 * S3-compatible implementation of IStorageService
 * Provides object storage with presigned URLs and streaming support
 */
@Injectable()
export class StorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private initializedBuckets = new Set<string>();

  constructor(
    private readonly s3Client: S3ClientService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.initializeDefaultBuckets();
    } catch (error) {
      this.logger.error(
        '[STORAGE:INIT] Failed to initialize default buckets',
        error,
      );
    }
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
      await this.s3Client.listFiles(bucket);
      this.initializedBuckets.add(bucket);
      this.logger.debug(`[STORAGE:BUCKET] Already exists: ${bucket}`);
    } catch {
      // Bucket doesn't exist - create it
      try {
        // S3ClientService relies on upload to create bucket
        this.initializedBuckets.add(bucket);
        this.logger.log(`[STORAGE:BUCKET] Will use bucket: ${bucket}`);
      } catch (error) {
        this.logger.warn(`[STORAGE:BUCKET] Could not ensure: ${bucket}`, error);
      }
    }
  }

  /**
   * Ensures dynamic bucket exists for specific RUC and type
   */
  async ensureBucketForRuc(ruc: string, type: SriStorageType): Promise<string> {
    const prefix = this.configService.get<string>(
      'STORAGE_BUCKET_PREFIX',
      'sri',
    );
    const bucket = getBucketName(ruc, type, prefix);
    await this.ensureBucketExists(bucket);
    return bucket;
  }

  async upload(
    bucket: string,
    key: string,
    buffer: Buffer,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const contentType = options?.contentType || 'application/octet-stream';

    await this.s3Client.uploadFile(bucket, key, buffer, {
      contentType,
      metadata: options?.metadata,
    });

    this.logger.debug(
      `[STORAGE:UPLOAD] ${bucket}/${key} (${buffer.length} bytes)`,
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
    expiresInSeconds: number,
  ): Promise<string> {
    if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      throw new Error(
        `[STORAGE] Invalid expiresInSeconds: ${expiresInSeconds}. Must be a positive number of seconds.`,
      );
    }
    if (expiresInSeconds > 3600) {
      throw new Error(
        `[STORAGE] Presigned URL TTL capped at 3600s (60 minutes) for download URLs. Received ${expiresInSeconds}s.`,
      );
    }
    return this.s3Client.getPresignedUrl(bucket, key, expiresInSeconds);
  }

  async refreshUrl(
    bucket: string,
    key: string,
    expiresInSeconds: number,
  ): Promise<string> {
    // S3-compatible storage generates fresh presigned URLs each time
    return this.getUrl(bucket, key, expiresInSeconds);
  }

  async delete(bucket: string, key: string): Promise<void> {
    await this.s3Client.deleteFile(bucket, key);
    this.logger.debug(`[STORAGE:DELETE] ${bucket}/${key}`);
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    return this.s3Client.fileExists(bucket, key);
  }

  async list(bucket: string, prefix?: string): Promise<string[]> {
    return this.s3Client.listFiles(bucket, prefix);
  }

  async getObject(bucket: string, key: string): Promise<Readable> {
    return this.s3Client.getFileStream(bucket, key);
  }

  async getMetadata(
    bucket: string,
    key: string,
  ): Promise<{ size: number; contentType: string } | null> {
    const metadata = await this.s3Client.getFileMetadata(bucket, key);
    if (!metadata) return null;
    return {
      size: metadata.size,
      contentType: metadata.contentType,
    };
  }
}
