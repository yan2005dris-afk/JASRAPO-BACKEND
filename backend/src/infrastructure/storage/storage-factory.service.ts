import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioStorageService, SRI_BUCKETS } from './minio-storage.service';
import { FilesystemStorageService } from './filesystem-storage.service';
import { IStorageService } from './interfaces/storage.interface';

/**
 * Factory service to choose between MinIO and Filesystem storage at runtime.
 * Prioritizes MinIO if enabled and available, falls back to Filesystem.
 */
@Injectable()
export class StorageServiceFactory {
  private storageService: IStorageService;

  constructor(
    private readonly minioService: MinioStorageService,
    private readonly fsService: FilesystemStorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Returns the active storage service based on configuration and availability.
   * Caches the selection after the first call.
   */
  getStorageService(): IStorageService {
    if (this.storageService) {
      return this.storageService;
    }

    const minioEnabled =
      this.configService.get<string>('MINIO_ENABLED', 'true').toLowerCase() ===
      'true';

    if (minioEnabled && this.minioService.isMinIO()) {
      this.storageService = this.minioService;
    } else {
      this.storageService = this.fsService;
    }

    return this.storageService;
  }

  /**
   * Returns true if MinIO is currently active.
   */
  isUsingMinIO(): boolean {
    return this.getStorageService().isMinIO();
  }

  /**
   * Returns the SRI_BUCKETS constant.
   * Includes SRI-specific and general application buckets (readings, profile photos).
   */
  getSriBuckets() {
    return SRI_BUCKETS;
  }
}
