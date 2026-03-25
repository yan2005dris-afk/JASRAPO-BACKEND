import * as Minio from 'minio';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client | null = null;
  isAvailable = false;

  private readonly defaultBuckets = ['avatars', 'documents', 'uploads'];

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const enabled = this.configService.get<string>('MINIO_ENABLED', 'true');
    
    if (enabled.toLowerCase() === 'false') {
      this.logger.warn('[MINIO:DISABLED] MinIO está deshabilitado');
      return;
    }

    const rawPort = this.configService.getOrThrow<string>('MINIO_PORT');
    const minioPort = Number(rawPort);
    if (!Number.isInteger(minioPort) || minioPort < 1 || minioPort > 65535) {
      this.logger.warn(`[MINIO:DISABLED] MINIO_PORT inválido: "${rawPort}"`);
      return;
    }

    const rawUseSSL = this.configService
      .getOrThrow<string>('MINIO_USE_SSL')
      .trim()
      .toLowerCase();
    if (rawUseSSL !== 'true' && rawUseSSL !== 'false') {
      this.logger.warn(`[MINIO:DISABLED] MINIO_USE_SSL inválido: "${rawUseSSL}"`);
      return;
    }

    this.minioClient = new Minio.Client({
      endPoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      port: minioPort,
      useSSL: rawUseSSL === 'true',
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });

    try {
      await this.minioClient.listBuckets();
      this.isAvailable = true;
      this.logger.log('[MINIO:UP] Conexión a MinIO establecida correctamente');
    } catch (error) {
      this.minioClient = null;
      this.logger.warn('[MINIO:DOWN] No se pudo conectar a MinIO. Storage deshabilitado.');
      return;
    }

    for (const bucket of this.defaultBuckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket);
          this.logger.log(`Bucket "${bucket}" creado`);
        }
      } catch (error) {
        this.logger.warn(`No se pudo verificar/crear bucket "${bucket}": ${error}`);
      }
    }
  }

  private ensureAvailable(): void {
    if (!this.isAvailable || !this.minioClient) {
      throw new Error('MinIO no está disponible. Configure MINIO_ENABLED=true para habilitar.');
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

  async getPresignedUrl(bucketName: string, fileName: string): Promise<string> {
    this.ensureAvailable();
    return this.minioClient!.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
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
      const stream = this.minioClient!.listObjects(bucketName, prefix || '', true);
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
