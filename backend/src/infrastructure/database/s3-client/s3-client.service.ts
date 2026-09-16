import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadBucketCommand,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';
import { Readable } from 'stream';

@Injectable()
export class S3ClientService implements OnModuleInit {
  private readonly logger = new Logger(S3ClientService.name);
  private s3Client: S3Client | null = null;
  isAvailable = false;

  private readonly defaultBuckets = ['avatars', 'documents', 'uploads'];

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const endpoint = this.configService.get<string>(
      'STORAGE_ENDPOINT',
      'localhost',
    );
    const port = this.configService.get<number>('STORAGE_PORT', 9000);
    const storageUseSsl = this.configService.get<string>(
      'STORAGE_USE_SSL',
      'true',
    );
    const useSsl = storageUseSsl === 'true';
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const accessKey =
      this.configService.getOrThrow<string>('STORAGE_ACCESS_KEY');
    const secretKey =
      this.configService.getOrThrow<string>('STORAGE_SECRET_KEY');

    // STORAGE_SSL_VERIFY controls whether the AWS SDK TLS layer validates the
    // server certificate. Defaults to true (verify). Set to false ONLY when
    // connecting to a server with a self-signed certificate that the host
    // does not trust (typical in dev/staging with local RustFS). A warning
    // is logged at startup whenever this escape hatch is engaged so the
    // posture is visible in production-like environments.
    const storageSslVerify = this.configService.get<string>(
      'STORAGE_SSL_VERIFY',
      'true',
    );
    const sslVerify = storageSslVerify !== 'false';
    if (!sslVerify) {
      this.logger.warn(
        `[STORAGE] STORAGE_SSL_VERIFY=false: TLS certificate verification is disabled. The client will trust any certificate presented by the storage endpoint (${endpoint}:${port}). Use ONLY in dev or staging with self-signed certs; production MUST keep this on.`,
      );
    }

    if (nodeEnv === 'production' && !sslVerify) {
      throw new Error(
        `[STORAGE] Refusing to start: STORAGE_SSL_VERIFY must not be "false" when NODE_ENV=production. Disabling TLS certificate verification would allow a MITM attacker to intercept credentials and document bodies (issue #187, OWASP A02).`,
      );
    }

    if (!accessKey || accessKey.trim().length === 0) {
      throw new Error(
        '[STORAGE] STORAGE_ACCESS_KEY is missing or empty. Application cannot start without explicit S3 credentials.',
      );
    }
    if (!secretKey || secretKey.trim().length === 0) {
      throw new Error(
        '[STORAGE] STORAGE_SECRET_KEY is missing or empty. Application cannot start without explicit S3 credentials.',
      );
    }

    if (nodeEnv === 'production' && storageUseSsl !== 'true') {
      throw new Error(
        `[STORAGE] Refusing to start: STORAGE_USE_SSL must be "true" when NODE_ENV=production. Cleartext S3 connection would expose credentials and document bodies on the wire (issue #141, OWASP A02).`,
      );
    }

    if (!port || port < 1 || port > 65535) {
      throw new Error(
        `[STORAGE] Invalid STORAGE_PORT value: "${port}". Application cannot start without a valid storage connection.`,
      );
    }

    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      requestHandler: new NodeHttpHandler({
        httpAgent: new HttpAgent({ keepAlive: true }),
        httpsAgent: new HttpsAgent({
          keepAlive: true,
          rejectUnauthorized: sslVerify,
        }),
      }),
    });

    try {
      await this.s3Client.send(new ListBucketsCommand({}));
      this.isAvailable = true;
      this.logger.log(
        '[S3:READY] S3-compatible storage connection established successfully',
      );
    } catch (error) {
      this.s3Client = null;
      throw new Error(
        `[S3] Failed to connect to S3-compatible storage at ${endpoint}:${port}. Application cannot start without storage. Original error: ${error}`,
      );
    }

    for (const bucket of this.defaultBuckets) {
      try {
        await this.ensureBucket(bucket);
        this.logger.log(`Bucket "${bucket}" created`);
      } catch (error) {
        this.logger.warn(
          `Could not verify/create bucket "${bucket}": ${error}`,
        );
      }
    }
  }

  private ensureAvailable(): void {
    if (!this.isAvailable || !this.s3Client) {
      throw new Error(
        'S3-compatible storage is not available. The service failed to connect during startup.',
      );
    }
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    buffer: Buffer,
    options: { contentType?: string; metadata?: Record<string, string> } = {},
  ): Promise<string> {
    this.ensureAvailable();
    await this.ensureBucket(bucketName);
    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: options.contentType,
        Metadata: options.metadata,
      }),
    );
    return fileName;
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    this.ensureAvailable();
    await this.s3Client!.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: fileName }),
    );
  }

  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    if (!this.isAvailable || !this.s3Client) return false;
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: bucketName, Key: fileName }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getFileMetadata(
    bucketName: string,
    fileName: string,
  ): Promise<{ size: number; contentType: string; lastModified: Date } | null> {
    if (!this.isAvailable || !this.s3Client) return null;
    try {
      const head = await this.s3Client.send(
        new HeadObjectCommand({ Bucket: bucketName, Key: fileName }),
      );
      return {
        size: head.ContentLength ?? 0,
        contentType: head.ContentType ?? 'application/octet-stream',
        lastModified: head.LastModified ?? new Date(0),
      };
    } catch {
      return null;
    }
  }

  async getPresignedUrl(
    bucketName: string,
    fileName: string,
    expiresInSeconds: number,
  ): Promise<string> {
    this.ensureAvailable();
    if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      throw new Error(
        `[S3] Invalid expiresInSeconds: ${expiresInSeconds}. Must be a positive number of seconds.`,
      );
    }
    if (expiresInSeconds > 3600) {
      throw new Error(
        `[S3] Presigned URL TTL capped at 3600s (60 minutes) for download URLs. Received ${expiresInSeconds}s.`,
      );
    }
    return getSignedUrl(
      this.s3Client!,
      new GetObjectCommand({ Bucket: bucketName, Key: fileName }),
      { expiresIn: expiresInSeconds },
    );
  }

  async getFileStream(bucketName: string, fileName: string): Promise<Readable> {
    this.ensureAvailable();
    const response = await this.s3Client!.send(
      new GetObjectCommand({ Bucket: bucketName, Key: fileName }),
    );
    return response.Body as Readable;
  }

  async listFiles(bucketName: string, prefix?: string): Promise<string[]> {
    this.ensureAvailable();
    await this.ensureBucket(bucketName);
    const result = await this.s3Client!.send(
      new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix || '' }),
    );
    return (result.Contents ?? []).map((item) => item.Key!).filter(Boolean);
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    try {
      await this.s3Client!.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch {
      await this.s3Client!.send(
        new CreateBucketCommand({ Bucket: bucketName }),
      );
    }
  }
}
