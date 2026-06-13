import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';
import { S3ClientModule } from '../database/s3-client/s3-client.module';

/**
 * Storage Module - Exports StorageService for file operations
 *
 * S3-compatible storage (RustFS) is the sole storage backend. The application will fail at startup
 * if the storage service is unreachable (fail-fast behavior).
 */
@Global()
@Module({
  imports: [ConfigModule, S3ClientModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
