import { randomUUID } from 'crypto';
import type { StorageService } from 'src/infrastructure/storage/storage.service';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';

/**
 * Uploads a reading photo to the READINGS bucket.
 * Returns the storage key to be persisted on the reading record.
 *
 * Pattern mirrors the existing avatar-upload.helper.ts.
 */
export async function uploadReadingPhoto(
  file: Express.Multer.File,
  storageService: StorageService,
): Promise<string> {
  const ext = file.originalname.split('.').pop() ?? 'jpg';
  const key = `readings/${randomUUID()}.${ext}`;

  await storageService.upload(SRI_STORAGE_TYPES.READINGS, key, file.buffer, {
    contentType: file.mimetype,
  });

  return key;
}

/**
 * Fire-and-forget rollback: deletes an already-uploaded reading photo key
 * when the downstream database operation fails.
 */
export async function rollbackReadingPhoto(
  key: string,
  storageService: StorageService,
): Promise<void> {
  await storageService.delete(SRI_STORAGE_TYPES.READINGS, key).catch(() => {});
}
