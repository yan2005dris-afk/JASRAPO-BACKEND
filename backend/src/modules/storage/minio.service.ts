import * as Minio from 'minio';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;

  /** Buckets que se crean automáticamente al iniciar el módulo */
  private readonly defaultBuckets = ['avatars', 'documents', 'uploads'];

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'admin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'password123',
    });
  }

  async onModuleInit() {
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

  async uploadFile(bucketName: string, fileName: string, buffer: Buffer): Promise<string> {
    await this.ensureBucket(bucketName);
    await this.minioClient.putObject(bucketName, fileName, buffer);
    return fileName;
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }

  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, fileName);
      return true;
    } catch {
      return false;
    }
  }

  async getFileMetadata(bucketName: string, fileName: string): Promise<{ size: number; contentType: string; lastModified: Date } | null> {
    try {
      const stat = await this.minioClient.statObject(bucketName, fileName);
      return {
        size: stat.size,
        contentType: stat.metaData?.['content-type'] || 'application/octet-stream',
        lastModified: stat.lastModified,
      };
    } catch {
      return null;
    }
  }

  async getPresignedUrl(bucketName: string, fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
  }

  async getFileStream(bucketName: string, fileName: string): Promise<any> {
    return await this.minioClient.getObject(bucketName, fileName);
  }

  async listFiles(bucketName: string, prefix?: string): Promise<string[]> {
    await this.ensureBucket(bucketName);
    return new Promise((resolve, reject) => {
      const files: string[] = [];
      const stream = this.minioClient.listObjects(bucketName, prefix || '', true);
      stream.on('data', (obj) => {
        if (obj.name) files.push(obj.name);
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }
}
