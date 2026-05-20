import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/identity/auth/auth.module';
import { MinioStorageService } from './minio-storage.service';
import { FilesystemStorageService } from './filesystem-storage.service';
import { StorageServiceFactory } from './storage-factory.service';
import { MinioModule } from '../database/minio/minio.module';

/**
 * Storage Module - Exports MinioStorageService for file operations
 *
 * FilesystemStorageService is available as fallback if needed
 * StorageServiceFactory provides a unified entry point
 */
@Global()
@Module({
  imports: [forwardRef(() => AuthModule), ConfigModule, MinioModule],
  providers: [
    MinioStorageService,
    StorageServiceFactory,
    {
      provide: FilesystemStorageService,
      useFactory: () => new FilesystemStorageService(),
    },
  ],
  exports: [
    MinioStorageService,
    FilesystemStorageService,
    StorageServiceFactory,
  ],
})
export class StorageModule {}
