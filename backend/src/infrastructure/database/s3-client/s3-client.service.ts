import * as Minio from 'minio';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class S3ClientService implements OnModuleInit {
  private readonly logger = new Logger(S3ClientService.name);
  private minioClient: Minio.Client | null = null;
  isAvailable = false;

  private readonly defaultBuckets = ['avatars', 'documents', 'uploads'];

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const endpoint = this.configService.get<string>(
      'STORAGE_ENDPOINT',
      'localhost',
    );
    const port = this.configService.get<number>('STORAGE_PORT', 9000);
    const useSsl =
      this.configService.get<string>('STORAGE_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get<string>(
      'STORAGE_ACCESS_KEY',
      'admin',
    );
    const secretKey = this.configService.get<string>(
      'STORAGE_SECRET_KEY',
      'password123',
    );

    if (!port || port < 1 || port > 65535) {
      throw new Error(
        `[STORAGE] Invalid STORAGE_PORT value: "${port}". Application cannot start without a valid storage connection.`,
      );
    }

    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL: useSsl,
      accessKey,
      secretKey,
    });

    try {
      await this.minioClient.listBuckets();
      this.isAvailable = true;
      this.logger.log('[MINIO:UP] MinIO connection established successfully');
    } catch (error) {
      this.minioClient = null;
      throw new Error(
        `[MINIO] Failed to connect to MinIO at ${endpoint}:${port}. Application cannot start without MinIO. Original error: ${error}`,
      );
    }

    for (const bucket of this.defaultBuckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket);
          this.logger.log(`Bucket "${bucket}" created`);
        }
      } catch (error) {
        this.logger.warn(
          `Could not verify/create bucket "${bucket}": ${error}`,
        );
      }
    }
  }

  private ensureAvailable(): void {
    if (!this.isAvailable || !this.minioClient) {
      throw new Error(
        'MinIO is not available. The service failed to connect during startup.',
      );
    }
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<string> {
    this.ensureAvailable();
    await this.ensureBucket(bucketName);
    await this.minioClient!.putObject(bucketName, fileName, buffer);
    return fileName;
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    this.ensureAvailable();
    await this.minioClient!.removeObject(bucketName, fileName);
  }

  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    if (!this.isAvailable || !this.minioClient) return false;
    try {
      await this.minioClient.statObject(bucketName, fileName);
      return true;
    } catch {
      return false;
    }
  }

  async getFileMetadata(
    bucketName: string,
    fileName: string,
  ): Promise<{ size: number; contentType: string; lastModified: Date } | null> {
    if (!this.isAvailable || !this.minioClient) return null;
    try {
      const stat = await this.minioClient.statObject(bucketName, fileName);
      const rawMeta = stat.metaData as unknown;
      const contentTypeRaw =
        rawMeta && typeof rawMeta === 'object'
          ? (rawMeta as Record<string, unknown>)['content-type']
          : undefined;
      return {
        size: stat.size,
        contentType:
          typeof contentTypeRaw === 'string'
            ? contentTypeRaw
            : 'application/octet-stream',
        lastModified: stat.lastModified,
      };
    } catch {
      return null;
    }
  }

  async getPresignedUrl(
    bucketName: string,
    fileName: string,
    expiresInSeconds = 24 * 60 * 60,
  ): Promise<string> {
    this.ensureAvailable();
    return this.minioClient!.presignedGetObject(
      bucketName,
      fileName,
      expiresInSeconds,
    );
  }

  async getFileStream(bucketName: string, fileName: string): Promise<Readable> {
    this.ensureAvailable();
    return this.minioClient!.getObject(bucketName, fileName);
  }

  async listFiles(bucketName: string, prefix?: string): Promise<string[]> {
    this.ensureAvailable();
    await this.ensureBucket(bucketName);
    return new Promise((resolve, reject) => {
      const files: string[] = [];
      const stream = this.minioClient!.listObjects(
        bucketName,
        prefix || '',
        true,
      );
      stream.on('data', (obj) => {
        if (obj.name) files.push(obj.name);
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.minioClient!.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient!.makeBucket(bucketName);
    }
  }
}
